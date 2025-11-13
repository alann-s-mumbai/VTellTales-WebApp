using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace VTellTales_WA.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();

            /* var defaultApp = FirebaseApp.Create(new AppOptions()
             {
                 Credential = GoogleCredential.FromFile(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "vtelltales-auth.json")),
             });
             Console.WriteLine(defaultApp.Name); // "[DEFAULT]"
             var message = new Message()
             {
                 Data = new Dictionary<string, string>()
                 {
                     ["FirstName"] = "John",
                     ["LastName"] = "Doe"
                 },
                 Notification = new Notification
                 {
                     Title = "Message Title",
                     Body = "Message Body"
                 },

                 //Token = "d3aLewjvTNw:APA91bE94LuGCqCSInwVaPuL1RoqWokeSLtwauyK-r0EmkPNeZmGavSG6ZgYQ4GRjp0NgOI1p-OAKORiNPHZe2IQWz5v1c3mwRE5s5WTv6_Pbhh58rY0yGEMQdDNEtPPZ_kJmqN5CaIc",
                 Topic = "news"
             };
             var messaging = FirebaseMessaging.DefaultInstance;
             var result = await messaging.SendAsync(message);
             Console.WriteLine(result);*/
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
