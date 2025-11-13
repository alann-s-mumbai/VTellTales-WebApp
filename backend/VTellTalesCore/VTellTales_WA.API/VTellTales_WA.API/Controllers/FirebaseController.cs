using FirebaseAdmin.Messaging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VTellTales_WA.API.Controllers
{
    interface FirebaseController
    {

        public class FireBaseService : Controller
        {
            // Configuration may be null in some code paths; mark nullable to satisfy the compiler.
            private static IConfiguration? _configuration;

            public FireBaseService(IConfiguration configuration)
            {
                _configuration = configuration;

            }

            [HttpPost]
            [Route("api/SendNotificationSingle")]
            public virtual async Task<string> SendNotificationSingle(String title, String body, String token)
            {
                try
                {
                   
                    var message = new Message()
                    {
                        Data = new Dictionary<string, string>()
                        {
                            ["FirstName"] = "Vtell",
                            ["LastName"] = "Tales"
                        },
                        Notification = new FirebaseAdmin.Messaging.Notification
                        {
                            Title = "Hello " + title,
                            Body = body
                        },
                        // Token = "cxzUxLjBQtOWkacgfsSOpW:APA91bE8xykX2UfmkNBxEeNtqu-8ACLXVm2dY77YZKFHx0h5u2wcNH19ErTHZ0PKgnrNr8UHxuWXJ3IhJvFgmadJAkKEQmOWiQHIPuwHsGaN0aRJ79haapfjCRZ-0mt1uX7MKHFu-yBT"
                        Token = token, //"dCNS_a7IQYelsih7ikCJmJ:APA91bHzIiV1FQCFppr1ZZirBwZVzUkZObisJVhDMBwrsDvMnUWQZKF5blgOhJfSYRowMGTH3rvbel31T6VuWl-NfNMo_ghIEKR3yivtIT1Tlvv_a6_zfsz1g4OgE3q4EjHCu2zwzGHa",
                                       //Topic = "all",
                    };
                    var messaging = FirebaseMessaging.DefaultInstance;
                    var result = await messaging.SendAsync(message);
                    Console.WriteLine(result);
                    return "...";
                }
                catch (Exception e)
                {
                    return e.Message.ToString();
                }
                // Response is a message ID string.

            }


            [HttpPost]
            [Route("api/SendNotification")]
            public virtual async Task<string> SendNotification(int uid)
            {
                //string credential_path = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "socialindexkey.json");
                //System.Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credential_path);
                //var utoken = GetTokenbyUserid(uid);
                //var s = SendNotificationSingle("Hi,", " sent you a friend request.", utoken);

                var message = new Message()
                {
                    Data = new Dictionary<string, string>()
                    {
                        ["FirstName"] = "Vtell",
                        ["LastName"] = "Tales"
                    },
                    Notification = new FirebaseAdmin.Messaging.Notification
                    {
                        Title = "Image Message Title from.net Image",
                        Body = "Image Message Body from vtell tales",
                        ImageUrl = "https://data.vtelltales.com/appImages/user-default.png",
                    },
                    Token = "cxzUxLjBQtOWkacgfsSOpW:APA91bE8xykX2UfmkNBxEeNtqu-8ACLXVm2dY77YZKFHx0h5u2wcNH19ErTHZ0PKgnrNr8UHxuWXJ3IhJvFgmadJAkKEQmOWiQHIPuwHsGaN0aRJ79haapfjCRZ-0mt1uX7MKHFu-yBT"
                    //Token = utoken, // "dCNS_a7IQYelsih7ikCJmJ:APA91bHzIiV1FQCFppr1ZZirBwZVzUkZObisJVhDMBwrsDvMnUWQZKF5blgOhJfSYRowMGTH3rvbel31T6VuWl-NfNMo_ghIEKR3yivtIT1Tlvv_a6_zfsz1g4OgE3q4EjHCu2zwzGHa",
                    //Topic = "all",
                };
                var messaging = FirebaseMessaging.DefaultInstance;
                var result = await messaging.SendAsync(message);
                Console.WriteLine(result);
                // Response is a message ID string.
                return "Successfully sent message: " + result;
            }
        }
    }

}
