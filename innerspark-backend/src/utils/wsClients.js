export const clients = new Map(); // userId -> Set<WebSocket>

export const broadcastToUser = (userId, data) => {
  const userClients = clients.get(userId);
  if (!userClients?.size) return;
  const payload = JSON.stringify(data);
  userClients.forEach(ws => {
    if (ws.readyState === 1) ws.send(payload);
  });
};

export const broadcastToAll = (data, exceptUserId = null) => {
  const payload = JSON.stringify(data);
  clients.forEach((userClients, uid) => {
    if (uid === exceptUserId) return;
    userClients.forEach(ws => {
      if (ws.readyState === 1) ws.send(payload);
    });
  });
};

export const getOnlineUserIds = () => Array.from(clients.keys());
