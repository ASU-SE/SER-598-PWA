export class ReminderManager {
  constructor() {
    this.reminderButton = document.querySelector("#reminder");
    this.initialize();
  }

  async initialize() {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          this.createButton();
          this.restoreReminder();
        }
      }
    } catch (error) {
      console.error("Reminder setup failed:", error);
    }
  }

  async restoreReminder() {
    const savedReminder = localStorage.getItem("studyReminder");
    if (savedReminder) {
      try {
        const { time } = JSON.parse(savedReminder);
        const [hours, minutes] = time.split(":").map(Number);

        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);

        if (reminderTime < new Date()) {
          reminderTime.setDate(reminderTime.getDate() + 1);
        }

        await this.waitForServiceWorker();

        navigator.serviceWorker.controller.postMessage({
          type: "SET_REMINDER",
          time: reminderTime.toISOString(),
          message: "Time for your daily study session!",
        });

        console.log(`Restored daily reminder for ${time}`);
      } catch (error) {
        console.error("Failed to restore reminder:", error);
        localStorage.removeItem("studyReminder"); // Clear invalid reminder
      }
    }
  }

  createButton() {
    // Clear any existing buttons first
    this.reminderButton.innerHTML = "";

    // Create new button
    const button = document.createElement("button");
    button.innerHTML = "🔔";

    // Add click handler directly here
    button.addEventListener("click", () => this.setReminder());

    this.reminderButton.appendChild(button);
  }

  async waitForServiceWorker() {
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          resolve();
        });
      });
    }
  }

  async setReminder() {
    try {
      const time = prompt("Set daily reminder time (HH:MM):", "09:00");
      if (!time) return;

      if (!/^\d{2}:\d{2}$/.test(time)) {
        throw new Error(
          "Invalid time format. Please use HH:MM format (e.g., 09:00)"
        );
      }

      const [hours, minutes] = time.split(":").map(Number);
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error("Invalid time values");
      }

      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      if (reminderTime < new Date()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      await this.waitForServiceWorker();

      // Store the reminder time for persistence
      localStorage.setItem(
        "studyReminder",
        JSON.stringify({
          time: time,
          lastSet: new Date().toISOString(),
        })
      );

      navigator.serviceWorker.controller.postMessage({
        type: "SET_REMINDER",
        time: reminderTime.toISOString(),
        message: "Time for your daily study session!",
      });

      alert(`Daily reminder set for ${time}`);
    } catch (error) {
      console.error("Failed to set reminder:", error);
      alert(`Failed to set reminder: ${error.message}`);
    }
  }
}
