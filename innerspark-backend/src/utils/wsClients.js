export const clients = new Map(); // userId -> Set<WebSocket>

export const broadcastToUser = (userId, data) => {
  const userClients = clients.get(userId);
  if (!userClients?.size) return;
  const payload = JSON.stringify(data);
  userClients.forEach(ws => {
    if (ws.readyState === 1) ws.send(payload);
  });
};
