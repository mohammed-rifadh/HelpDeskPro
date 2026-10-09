namespace HelpDeskPro;

using HelpDeskPro.Data;
using HelpDeskPro.Helpers;
using HelpDeskPro.Hubs;
using HelpDeskPro.Middleware;
using HelpDeskPro.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using System.Text;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);


        // =====================================================
        // CORS
        // =====================================================

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowReactApp", policy =>
            {
                policy
                    .WithOrigins("http://localhost:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });


        // =====================================================
        // CONTROLLERS
        // =====================================================

        builder.Services.AddControllers();


        // =====================================================
        // SWAGGER
        // =====================================================

        builder.Services.AddEndpointsApiExplorer();

        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition(
                "Bearer",
                new Microsoft.OpenApi.OpenApiSecurityScheme
                {
                    Name = "Authorization",

                    Type = Microsoft.OpenApi.SecuritySchemeType.Http,

                    Scheme = "Bearer",

                    BearerFormat = "JWT",

                    In = Microsoft.OpenApi.ParameterLocation.Header,

                    Description = "Enter your JWT token."
                });

            options.AddSecurityRequirement(document =>
                new Microsoft.OpenApi.OpenApiSecurityRequirement
                {
                    [
                        new Microsoft.OpenApi.OpenApiSecuritySchemeReference(
                            "Bearer",
                            document)
                    ] = new List<string>()
                });
        });


        // =====================================================
        // DATABASE
        // =====================================================

        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(
                builder.Configuration.GetConnectionString(
                    "DefaultConnection"
                )
            ));


        // =====================================================
        // DEPENDENCY INJECTION
        // =====================================================

        builder.Services.AddScoped<JwtHelper>();

        builder.Services.AddScoped<AuthService>();

        builder.Services.AddScoped<UserService>();

        builder.Services.AddScoped<TicketService>();

        builder.Services.AddScoped<TicketCommentService>();

        builder.Services.AddScoped<CategoryService>();

        builder.Services.AddScoped<DashboardService>();

        builder.Services.AddScoped<TicketStatusHistoryService>();

        builder.Services.AddScoped<ReportService>();

        // Notification Service
        builder.Services.AddScoped<NotificationService>();

        builder.Services.AddScoped<AgentProfileService>();

        builder.Services.AddScoped<EmployeeProfileService>();

        builder.Services.AddScoped<AdminProfileService>();
        // =====================================================
        // SIGNALR
        // =====================================================

        builder.Services.AddSignalR();


        // =====================================================
        // JWT AUTHENTICATION
        // =====================================================

        builder.Services.AddAuthentication(
            JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                // -------------------------------------------------
                // JWT TOKEN VALIDATION
                // -------------------------------------------------

                options.TokenValidationParameters =
                    new TokenValidationParameters
                    {
                        ValidateIssuer = true,

                        ValidateAudience = true,

                        ValidateLifetime = true,

                        ValidateIssuerSigningKey = true,

                        ValidIssuer =
                            builder.Configuration["Jwt:Issuer"],

                        ValidAudience =
                            builder.Configuration["Jwt:Audience"],

                        IssuerSigningKey =
                            new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(
                                    builder.Configuration["Jwt:Key"]!
                                )
                            )
                    };


                // -------------------------------------------------
                // SIGNALR JWT TOKEN
                // -------------------------------------------------

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken =
                            context.Request.Query["access_token"];

                        var path =
                            context.HttpContext.Request.Path;


                        // SignalR sends the JWT token using
                        // the access_token query parameter.

                        if (!string.IsNullOrEmpty(accessToken) &&
                            path.StartsWithSegments(
                                "/notificationHub"))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
            });


        // =====================================================
        // BUILD APPLICATION
        // =====================================================

        var app = builder.Build();


        // =====================================================
        // CORS
        // =====================================================

        app.UseCors("AllowReactApp");


        // =====================================================
        // EXCEPTION MIDDLEWARE
        // =====================================================

        app.UseMiddleware<ExceptionMiddleware>();


        // =====================================================
        // SWAGGER
        // =====================================================

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();

            app.UseSwaggerUI();
        }


        // =====================================================
        // HTTPS
        // =====================================================

        app.UseHttpsRedirection();


        // =====================================================
        // AUTHENTICATION
        // =====================================================

        app.UseAuthentication();


        // =====================================================
        // AUTHORIZATION
        // =====================================================

        app.UseAuthorization();


        // =====================================================
        // API CONTROLLERS
        // =====================================================

        app.MapControllers();


        // =====================================================
        // SIGNALR NOTIFICATION HUB
        // =====================================================

        app.MapHub<NotificationHub>(
            "/notificationHub"
        );


        // =====================================================
        // RUN APPLICATION
        // =====================================================

        app.Run();
    }
}