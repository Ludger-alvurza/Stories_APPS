self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  self.registration.getNotifications().then((notifications) => {
    notifications.forEach((notification) => notification.close());
  });

  const title = data.title || "Notifikasi";
  const options = {
    body: `${data.options.body}`,
    icon: data.options.icon || "/default-icon.png",
    data: data,
    timestamp: Date.now(),
  };

  self.registration.showNotification(title, options);
});
