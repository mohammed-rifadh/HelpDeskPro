import {
  HubConnectionBuilder,
  LogLevel
} from "@microsoft/signalr";

const HUB_URL =
  "https://localhost:7110/notificationHub";

let connection = null;


// =====================================================
// START SIGNALR CONNECTION
// =====================================================

export const startNotificationConnection = async (
  onNotification
) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn(
      "No JWT token found. SignalR connection skipped."
    );

    return;
  }


  // -----------------------------------------------------
  // Prevent duplicate connections
  // -----------------------------------------------------

  if (
    connection &&
    connection.state === "Connected"
  ) {
    return;
  }


  // -----------------------------------------------------
  // Create SignalR connection
  // -----------------------------------------------------

  connection = new HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => {
        return localStorage.getItem("token") || "";
      }
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();


  // -----------------------------------------------------
  // Receive notification from backend
  // -----------------------------------------------------

  connection.on(
    "ReceiveNotification",
    (notification) => {

      console.log(
        "🔔 New notification received:",
        notification
      );


      if (onNotification) {
        onNotification(notification);
      }
    }
  );


  // -----------------------------------------------------
  // Connection closed
  // -----------------------------------------------------

  connection.onclose((error) => {

    if (error) {
      console.error(
        "SignalR connection closed:",
        error
      );
    } else {
      console.log(
        "SignalR connection closed."
      );
    }

  });


  // -----------------------------------------------------
  // Start connection
  // -----------------------------------------------------

  try {

    await connection.start();

    console.log(
      "✅ SignalR connected successfully."
    );

  } catch (error) {

    console.error(
      "❌ SignalR connection failed:",
      error
    );

  }
};


// =====================================================
// STOP SIGNALR CONNECTION
// =====================================================

export const stopNotificationConnection = async () => {

  if (!connection) {
    return;
  }


  try {

    await connection.stop();

    console.log(
      "SignalR connection stopped."
    );

  } catch (error) {

    console.error(
      "Error stopping SignalR connection:",
      error
    );

  } finally {

    connection = null;

  }
};