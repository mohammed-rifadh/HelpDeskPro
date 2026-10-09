import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

import api from "../services/api";

import {
  startNotificationConnection,
  stopNotificationConnection
} from "../services/notificationService";


// =========================================================
// CREATE CONTEXT
// =========================================================

const NotificationContext =
  createContext(null);


// =========================================================
// PROVIDER
// =========================================================

export const NotificationProvider = ({
  children
}) => {

  // =======================================================
  // STATE
  // =======================================================

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [
    isNotificationSystemReady,
    setIsNotificationSystemReady
  ] = useState(false);

  const initializationRef =
    useRef(false);


  // =======================================================
  // LOAD NOTIFICATIONS
  // =======================================================

  const loadNotifications = async () => {
    try {

      const response =
        await api.get("/Notifications");

      setNotifications(
        response.data
      );

      console.log(
        "✅ Notifications loaded:",
        response.data
      );

    } catch (error) {

      console.error(
        "❌ Failed to load notifications:",
        error
      );

      setNotifications([]);
    }
  };


  // =======================================================
  // LOAD UNREAD COUNT
  // =======================================================

  const loadUnreadCount = async () => {
    try {

      const response =
        await api.get(
          "/Notifications/unread-count"
        );

      setUnreadCount(
        response.data.unreadCount
      );

      console.log(
        "🔔 Unread notification count:",
        response.data.unreadCount
      );

    } catch (error) {

      console.error(
        "❌ Failed to load unread count:",
        error
      );

      setUnreadCount(0);
    }
  };


  // =======================================================
  // HANDLE REAL-TIME NOTIFICATION
  // =======================================================

  const handleNewNotification = (
    notification
  ) => {

    console.log(
      "🔔 NEW REAL-TIME NOTIFICATION:",
      notification
    );


    // -----------------------------------------------------
    // Prevent duplicate notification
    // -----------------------------------------------------

    setNotifications(
      previous => {

        const alreadyExists =
          previous.some(
            item =>
              item.id ===
              notification.id
          );

        if (alreadyExists) {
          return previous;
        }

        return [
          notification,
          ...previous
        ];
      }
    );


    // -----------------------------------------------------
    // Increase unread count
    // -----------------------------------------------------

    setUnreadCount(
      previous =>
        previous + 1
    );
  };


  // =======================================================
  // INITIALIZE NOTIFICATION SYSTEM
  // =======================================================

  const initializeNotificationSystem =
    async () => {

      const token =
        localStorage.getItem("token");


      // -----------------------------------------------------
      // User not logged in
      // -----------------------------------------------------

      if (!token) {

        console.log(
          "🔕 No JWT token. Notification system waiting for login."
        );

        return;
      }


      // -----------------------------------------------------
      // Prevent duplicate initialization
      // -----------------------------------------------------

      if (initializationRef.current) {

        console.log(
          "ℹ️ Notification system already initialized."
        );

        return;
      }


      initializationRef.current = true;


      console.log(
        "🔔 Initializing notification system..."
      );


      try {

        // ---------------------------------------------------
        // STEP 1
        // Load notifications
        // ---------------------------------------------------

        await loadNotifications();


        // ---------------------------------------------------
        // STEP 2
        // Load unread count
        // ---------------------------------------------------

        await loadUnreadCount();


        // ---------------------------------------------------
        // STEP 3
        // Start SignalR
        // ---------------------------------------------------

        await startNotificationConnection(
          handleNewNotification
        );


        // ---------------------------------------------------
        // STEP 4
        // Mark system ready
        // ---------------------------------------------------

        setIsNotificationSystemReady(
          true
        );


        console.log(
          "✅ Notification system ready."
        );

      } catch (error) {

        console.error(
          "❌ Notification system initialization failed:",
          error
        );


        initializationRef.current =
          false;


        setIsNotificationSystemReady(
          false
        );
      }
    };


  // =======================================================
  // INITIALIZATION
  // =======================================================

  useEffect(() => {

    let mounted = true;


    const initialize = async () => {

      if (!mounted) {
        return;
      }

      await initializeNotificationSystem();
    };


    initialize();


    return () => {

      mounted = false;
    };

  }, []);


  // =======================================================
  // DETECT LOGIN
  // =======================================================

  useEffect(() => {

    const checkLoginStatus = () => {

      const token =
        localStorage.getItem("token");


      if (
        token &&
        !initializationRef.current
      ) {

        console.log(
          "🔑 Login detected. Starting notification system..."
        );

        initializeNotificationSystem();
      }
    };


    // -----------------------------------------------------
    // Check immediately
    // -----------------------------------------------------

    checkLoginStatus();


    // -----------------------------------------------------
    // Check every second
    // -----------------------------------------------------

    const interval =
      setInterval(
        checkLoginStatus,
        1000
      );


    return () => {

      clearInterval(interval);
    };

  }, []);


  // =======================================================
  // MARK AS READ
  // =======================================================

  const markAsRead = async (
    notificationId
  ) => {

    try {

      await api.patch(
        `/Notifications/${notificationId}/read`
      );


      setNotifications(
        previous =>
          previous.map(
            notification =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    isRead: true
                  }
                : notification
          )
      );


      setUnreadCount(
        previous =>
          Math.max(
            previous - 1,
            0
          )
      );


      console.log(
        `✅ Notification ${notificationId} marked as read.`
      );

    } catch (error) {

      console.error(
        "❌ Failed to mark notification as read:",
        error
      );
    }
  };


  // =======================================================
  // MARK ALL AS READ
  // =======================================================

  const markAllAsRead = async () => {

    try {

      await api.patch(
        "/Notifications/read-all"
      );


      setNotifications(
        previous =>
          previous.map(
            notification => ({
              ...notification,
              isRead: true
            })
          )
      );


      setUnreadCount(0);


      console.log(
        "✅ All notifications marked as read."
      );

    } catch (error) {

      console.error(
        "❌ Failed to mark all notifications as read:",
        error
      );
    }
  };


  // =======================================================
  // CLEAR NOTIFICATIONS
  // =======================================================

  const clearNotifications = () => {

    setNotifications([]);

    setUnreadCount(0);
  };


  // =======================================================
  // RESET NOTIFICATION SYSTEM
  // =======================================================

  const resetNotificationSystem =
    async () => {

      try {

        await stopNotificationConnection();

      } catch (error) {

        console.error(
          "❌ Error stopping notification connection:",
          error
        );
      }


      initializationRef.current =
        false;


      setNotifications([]);

      setUnreadCount(0);

      setIsNotificationSystemReady(
        false
      );


      console.log(
        "🔕 Notification system reset."
      );
    };


  // =======================================================
  // CONTEXT VALUE
  // =======================================================

  return (
    <NotificationContext.Provider
      value={{
        notifications,

        unreadCount,

        isNotificationSystemReady,

        markAsRead,

        markAllAsRead,

        clearNotifications,

        resetNotificationSystem
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};


// =========================================================
// CUSTOM HOOK
// =========================================================

export const useNotifications = () => {

  const context =
    useContext(
      NotificationContext
    );


  if (!context) {

    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }


  return context;
};