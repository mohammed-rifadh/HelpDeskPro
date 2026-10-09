using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace HelpDeskPro.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    // =========================================================
    // USER CONNECTED
    // =========================================================
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;

        if (!string.IsNullOrEmpty(userId))
        {
            var groupName = $"User_{userId}";

            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                groupName);

            Console.WriteLine(
                $"🔔 SignalR connected: User {userId} → {groupName}");
        }

        await base.OnConnectedAsync();
    }


    // =========================================================
    // USER DISCONNECTED
    // =========================================================
    public override async Task OnDisconnectedAsync(
        Exception? exception)
    {
        var userId = Context.UserIdentifier;

        if (!string.IsNullOrEmpty(userId))
        {
            var groupName = $"User_{userId}";

            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                groupName);

            Console.WriteLine(
                $"🔕 SignalR disconnected: User {userId} → {groupName}");
        }

        await base.OnDisconnectedAsync(exception);
    }
}