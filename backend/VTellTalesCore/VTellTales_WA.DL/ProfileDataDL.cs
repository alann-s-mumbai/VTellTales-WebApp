using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Extensions.Configuration;
using MySqlConnector;
using VTellTales_WA.DL.Interfaces;
using VTellTales_WA.DTO;

namespace VTellTales_WA.DL
{
    public class ProfileDataDL : IProfileDataDL
    {
        private readonly IConfiguration configuration;
        readonly string connString;
        public ProfileDataDL(IConfiguration _configuration)
        {
            configuration = _configuration;
            connString = configuration["ConnectionSettings:StoryBookDB"] ?? throw new InvalidOperationException("ConnectionSettings:StoryBookDB is not configured");
            //Connection = new MySqlConnection(configuration["ConnectionSettings:StoryBookDB"]);
        }
        public ProfileDataDTO? getTokan(string userID)
        {
            ProfileDataDTO? profileDataDTO = null;

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT tokan  FROM usertbl WHERE userid=@userid";
                cmd.Parameters.AddWithValue("@userid", userID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                         profileDataDTO = new ProfileDataDTO
                        {
                            userid = userID,
                            tokan = Convert.IsDBNull(reader["tokan"]) ? null : (string?)reader["tokan"],

                         };
                    }                              
            }

            return profileDataDTO; // new StoryDataDTO { UserID = userID, StoryText = "My Sample Story" };
        }

        public PushNotificationDTO? GetSingleProfileName(string userID)
        {
            PushNotificationDTO? profileDataDTO = null;

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                //cmd.CommandText = @"SELECT GROUP_CONCAT(name), GROUP_CONCAT(userid) FROM usertbl WHERE userid=@userid or userid=@sendto";
                cmd.CommandText = @"SELECT u.name as username, u.userid as userid FROM usertbl u WHERE u.userid=@userid";

                cmd.Parameters.AddWithValue("@userid", userID);
               // cmd.Parameters.AddWithValue("@sendto", sendto);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        //var array = reader.GetFieldValue<string>(0).ToString().Split(",");
                        var username = reader.IsDBNull(0) ? string.Empty : reader.GetString(0);
                        profileDataDTO = new PushNotificationDTO
                        {
                            userid = userID,
                            username = username,
                        };
                    }


            }

            return profileDataDTO; // new StoryDataDTO { UserID = userID, StoryText = "My Sample Story" };
        }

        public PushNotificationDTO? GetProfileName(string sendto,string userID)
        {
            PushNotificationDTO? profileDataDTO = null;

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                //cmd.CommandText = @"SELECT GROUP_CONCAT(name), GROUP_CONCAT(userid) FROM usertbl WHERE userid=@userid or userid=@sendto";
                cmd.CommandText = @"select GROUP_CONCAT(src.username),GROUP_CONCAT(src.userid) from (SELECT u.name as username, u.userid as userid FROM usertbl u WHERE u.userid=@userid  union select ut.name as sendname,ut.userid as sendid from usertbl ut where ut.userid =@sendto) as src ";

                cmd.Parameters.AddWithValue("@userid", userID);
                cmd.Parameters.AddWithValue("@sendto", sendto);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        var namesValue = reader.IsDBNull(0) ? string.Empty : reader.GetString(0);
                        var array = namesValue.Split(',', StringSplitOptions.RemoveEmptyEntries);
                        
                        profileDataDTO = new PushNotificationDTO
                        {
                            userid = userID,                           
                            username = array.Length > 0 ? array[0] : string.Empty,
                            sendtoid = sendto,
                            sendtoname = array.Length > 1 ? array[1] : string.Empty,
                        };
                    }

               
            }

            return profileDataDTO; // new StoryDataDTO { UserID = userID, StoryText = "My Sample Story" };
        }
        public List<PushNotificationDTO> GetNotificationuserlist(string userID)
        {
            List<PushNotificationDTO> pushNotificationsDTO = new List<PushNotificationDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"select distinct u.userid,followingid from usertbl u inner join following f on f.userid=u.userid where followingid=@userid";
                cmd.Parameters.AddWithValue("@userid", userID);
                //cmd.Parameters.AddWithValue("@userid", sendto);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        var followingId = reader.IsDBNull(1) ? string.Empty : reader.GetString(1);
                        var userId = reader.IsDBNull(0) ? string.Empty : reader.GetString(0);
                        
                        PushNotificationDTO profileDataDTO = new PushNotificationDTO
                        {
                            userid = followingId,
                            sendtoid = userId,
                        };
                        pushNotificationsDTO.Add(profileDataDTO);
                    }

                
            }
            return pushNotificationsDTO;
        }

        public int checkuser(string email)
        {
            int result = 3;

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT blockbyadmin  FROM usertbl WHERE email=@email";
                cmd.Parameters.AddWithValue("@email", email);

                //result = Convert.ToInt32(cmd.ExecuteScalar());
                    using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        result = reader.GetFieldValue<Int32>(0);
                    }
                if (result == 3)
                    result = 0;
                else if (result == 1)
                    result = 3;
                else if (result == 0)
                    result = 1;
            
            }
            return result; // new StoryDataDTO { UserID = userID, StoryText = "My Sample Story" };
        }
        public ProfileDataDTO? GetOtherProfile(string userID, string followingid)
        {
            ProfileDataDTO? profileDataDTO = null;

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT email,age,interest,location,cdate,name,profileimg,a.fan,b.fanof,c.fanflag,d.storycount  FROM usertbl u inner join (select f.followingid,count(*) as fan from following f " +
                                "where followingid=@userid)a inner join (select f.userid,count(*) as fanof from following f where userid=@userid)b inner join (select if(count(*)>0,1,0) as fanflag from following f " +
                                "where followingid=@userid and userid=@followingid)c inner join (select count(*) as storycount from userstory where userid=@userid)d  WHERE u.userid=@userid";
                cmd.Parameters.AddWithValue("@userid", userID);
                cmd.Parameters.AddWithValue("@followingid", followingid);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        var email = reader.IsDBNull(0) ? string.Empty : reader.GetString(0);
                        var name = reader.IsDBNull(5) ? string.Empty : reader.GetString(5);
                        
                        profileDataDTO = new ProfileDataDTO
                        {
                            userid = userID,
                            email = email,
                            age = Convert.IsDBNull(reader["age"]) ? string.Empty : (string?)reader["age"] ?? string.Empty,
                            interest = Convert.IsDBNull(reader["interest"]) ? string.Empty : (string?)reader["interest"] ?? string.Empty,
                            location = Convert.IsDBNull(reader["location"]) ? string.Empty : (string?)reader["location"] ?? string.Empty,
                            cdate = reader.IsDBNull(4) ? DateTime.MinValue : reader.GetDateTime(4),
                            name = name,
                            profileimg = Convert.IsDBNull(reader["profileimg"]) ? string.Empty : (string?)reader["profileimg"] ?? string.Empty,
                            following = reader.IsDBNull(7) ? 0 : reader.GetInt64(7),
                            follower = reader.IsDBNull(8) ? 0 : reader.GetInt64(8),
                            fanflag = reader.IsDBNull(9) ? 0 : reader.GetInt32(9),
                            stories = reader.IsDBNull(10) ? 0 : reader.GetInt64(10),
                        };
                    }

            }

            return profileDataDTO; // new StoryDataDTO { UserID = userID, StoryText = "My Sample Story" };
        }
        public ProfileDataDTO? GetProfile(string userID)
         {
             ProfileDataDTO? profileDataDTO = null;

             using (MySqlDatabase db = new MySqlDatabase(connString))
             {
                 var cmd = db.Connection.CreateCommand() as MySqlCommand;
                 cmd.CommandText = @"SELECT email,age,interest,location,cdate,name,profileimg  FROM usertbl WHERE userid=@userid";
                 cmd.Parameters.AddWithValue("@userid", userID);

                 using (var reader = cmd.ExecuteReader())
                     while (reader.Read())
                     {
                          var email = reader.IsDBNull(0) ? string.Empty : reader.GetString(0);
                          
                          profileDataDTO = new ProfileDataDTO
                          {
                              userid = userID,
                              email = email,
                              age = Convert.IsDBNull(reader["age"]) ? string.Empty : (string?)reader["age"] ?? string.Empty,
                              interest = Convert.IsDBNull(reader["interest"]) ? string.Empty : (string?)reader["interest"] ?? string.Empty,
                              location = Convert.IsDBNull(reader["location"]) ? string.Empty : (string?)reader["location"] ?? string.Empty,
                              cdate = reader.IsDBNull(4) ? DateTime.MinValue : reader.GetDateTime(4),
                              name = Convert.IsDBNull(reader["name"]) ? string.Empty : (string?)reader["name"] ?? string.Empty,
                              profileimg = Convert.IsDBNull(reader["profileimg"]) ? string.Empty : (string?)reader["profileimg"] ?? string.Empty,
                          };
                     }

                 cmd.CommandText = @"SELECT count(*)  FROM userstory WHERE userid=@userid";
                 //cmd.Parameters.AddWithValue("@userid", userID);

                 using (var reader = cmd.ExecuteReader())
                     while (reader.Read() && profileDataDTO != null)
                     {
                         profileDataDTO.stories = reader.IsDBNull(0) ? 0 : reader.GetInt64(0);
                     }

                 cmd.CommandText = @"SELECT count(*)  FROM following WHERE userid=@userid";
                 //cmd.Parameters.AddWithValue("@userid", userID);

                 using (var reader = cmd.ExecuteReader())
                     while (reader.Read() && profileDataDTO != null)
                     {
                         profileDataDTO.following = reader.IsDBNull(0) ? 0 : reader.GetInt64(0);
                     }

                 cmd.CommandText = @"SELECT count(*)  FROM following WHERE followingid=@userid";
                // cmd.Parameters.AddWithValue("@userid", userID);

                 using (var reader = cmd.ExecuteReader())
                     while (reader.Read() && profileDataDTO != null)
                     {
                         profileDataDTO.follower = reader.IsDBNull(0) ? 0 : reader.GetInt64(0);
                     }
             }

             return profileDataDTO; // new StoryDataDTO { UserID = userID, StoryText = "My Sample Story" };
         }
        public List<ProfileDataDTO> GetProfilelist(string userID)
        {
            List<ProfileDataDTO> profileDataDTO = new List<ProfileDataDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT email,age,interest,location,cdate,name,createdate  FROM usertbl WHERE userid=@userid";
                cmd.Parameters.AddWithValue("@userid", userID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        var email = reader.IsDBNull(0) ? string.Empty : reader.GetString(0);
                        var profileImg = reader.IsDBNull(6) ? string.Empty : reader.GetString(6);
                        
                        ProfileDataDTO temp = new ProfileDataDTO
                        {
                            userid = userID,
                            email = email,
                            age = Convert.IsDBNull(reader["age"]) ? string.Empty : (string?)reader["age"] ?? string.Empty,
                            interest = Convert.IsDBNull(reader["interest"]) ? string.Empty : (string?)reader["interest"] ?? string.Empty,
                            location = Convert.IsDBNull(reader["location"]) ? string.Empty : (string?)reader["location"] ?? string.Empty,
                            cdate = reader.IsDBNull(4) ? DateTime.MinValue : reader.GetDateTime(4),
                            name = Convert.IsDBNull(reader["name"]) ? string.Empty : (string?)reader["name"] ?? string.Empty,
                            profileimg = profileImg,
                        };
                        cmd.CommandText = @"SELECT count(*)  FROM following WHERE userid=@userid";
                        //cmd.Parameters.AddWithValue("@userid", userID);

                        using (var reader1 = cmd.ExecuteReader())
                            while (reader1.Read())
                            {
                                temp.follower = reader.IsDBNull(0) ? 0 : reader.GetInt64(0);
                            }

                        cmd.CommandText = @"SELECT count(*)  FROM following WHERE followingid=@userid";
                        // cmd.Parameters.AddWithValue("@userid", userID);

                        using (var reader2 = cmd.ExecuteReader())
                            while (reader2.Read())
                            {
                                temp.following = reader.GetFieldValue<Int64>(0);
                            }
                        profileDataDTO.Add(temp);
                    }
            }

            return profileDataDTO;
        }

        public int SaveProfile(ProfileDataDTO profileDataDTO)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"insert into usertbl (userid, email, password, age, interest, location, name, tokan) values (@userid, @email, @password, @age, @interest, @location, @name, @tokan)";
                cmd.Parameters.AddWithValue("@userid", profileDataDTO.userid);
                cmd.Parameters.AddWithValue("@password", profileDataDTO.password);
                cmd.Parameters.AddWithValue("@email", profileDataDTO.email);
                cmd.Parameters.AddWithValue("@age", profileDataDTO.age);
                cmd.Parameters.AddWithValue("@interest", profileDataDTO.interest);
                cmd.Parameters.AddWithValue("@location", profileDataDTO.location);
                //cmd.Parameters.AddWithValue("@cdate", profileDataDTO.cdate);
                cmd.Parameters.AddWithValue("@name", profileDataDTO.name);
                cmd.Parameters.AddWithValue("@tokan", profileDataDTO.tokan);
                result = cmd.ExecuteNonQuery();
            }
            return result;
        }

        public int UpdateProfile(ProfileDataDTO profileDataDTO)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                if(profileDataDTO.profileimg != null)
                    cmd.CommandText = @"Update usertbl set age=@age,interest=@interest,location=@location, name=@name, profileimg=@profileimg, udate=now() where userid = @userid";
                else
                {
                    cmd.CommandText = @"Update usertbl set age=@age,interest=@interest,location=@location, name=@name, udate=CURDATE() where userid = @userid";
                   
                }
                cmd.Parameters.AddWithValue("@userid", profileDataDTO.userid);
               // cmd.Parameters.AddWithValue("@email", profileDataDTO.email);
                cmd.Parameters.AddWithValue("@age", profileDataDTO.age);
                cmd.Parameters.AddWithValue("@interest", profileDataDTO.interest);
                cmd.Parameters.AddWithValue("@location", profileDataDTO.location);
                cmd.Parameters.AddWithValue("@name", profileDataDTO.name);
                if (profileDataDTO.profileimg != null)
                {
                    cmd.Parameters.AddWithValue("@profileimg", profileDataDTO.profileimg);
                }
                result = cmd.ExecuteNonQuery();
                try
                {
                    if (result == 1)
                    {
                        cmd = db.Connection.CreateCommand() as MySqlCommand;
                        cmd.CommandText = @"insert into notification (userid, notificationto,notification,notificationdate) values (@likebyid,@notificationto,6,now())";
                        cmd.Parameters.AddWithValue("@userid", profileDataDTO.userid);
                        cmd.Parameters.AddWithValue("@notificationto", profileDataDTO.userid);

                        int result1 = cmd.ExecuteNonQuery();
                    }
                }
                    catch (Exception) { }
            }
            return result;
        }

  public string updateToken(string userid , string token)
        {
            int result = 0;
            string err = "";
            try
            {
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                
                cmd.CommandText = @"Update usertbl set tokan=@tokan, udate=now() where userid = @userid";                   
                
                cmd.Parameters.AddWithValue("@userid", userid);
                cmd.Parameters.AddWithValue("@tokan", token);
                
                result = cmd.ExecuteNonQuery();
               
            }
            }catch(Exception e)
            {
                err = e.Message.ToString();
            }
           
            return result.ToString() + err;
        }



        public int UnFollowing(ProfileFollowingDTO profileUnFollowerDTO)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"delete from following where followingid = @followingid and userid= @userid";
                cmd.Parameters.AddWithValue("@userid", profileUnFollowerDTO.userid);
                cmd.Parameters.AddWithValue("@followingid", profileUnFollowerDTO.followingid);

                result = cmd.ExecuteNonQuery();
                try
                {
                    if (result == 1)
                    {
                        cmd = db.Connection.CreateCommand() as MySqlCommand;
                        cmd.CommandText = @"insert into notification (userid, notificationto,notification,notificationdate) values (@userid,@notificationto,7,now())";
                        cmd.Parameters.AddWithValue("@userid", profileUnFollowerDTO.userid);
                        cmd.Parameters.AddWithValue("@notificationto", profileUnFollowerDTO.followingid);

                        int result1 = cmd.ExecuteNonQuery();
                    }
                }
                    catch (Exception) { }
            }
            return result;
        }

        public int SaveFollowing(ProfileFollowingDTO profileFollowingDTO)
        {

            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {

                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT * FROM following WHERE userid = @userid  AND followingid = @followingid";
                cmd.Parameters.AddWithValue("@userid", profileFollowingDTO.userid);
                cmd.Parameters.AddWithValue("@followingid", profileFollowingDTO.followingid);
                var reader = cmd.ExecuteReader();
                if (reader.HasRows == false)

                {
                    reader.Close();

                    //  var cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"insert into following (userid, followingid) values (@userid, @followingid)";
                    // cmd.Parameters.AddWithValue("@userid", profileFollowingDTO.userid);
                    //cmd.Parameters.AddWithValue("@followingid", profileFollowingDTO.followingid);

                    result = cmd.ExecuteNonQuery();
                    try
                    {
                        if (result == 1)
                        {
                            cmd = db.Connection.CreateCommand() as MySqlCommand;
                            cmd.CommandText = @"insert into notification (userid, notificationto,notification,notificationdate) values (@userid,@notificationto,2,now())";
                            cmd.Parameters.AddWithValue("@userid", profileFollowingDTO.userid);
                            cmd.Parameters.AddWithValue("@notificationto", profileFollowingDTO.followingid);

                            int result1 = cmd.ExecuteNonQuery();
                        }
                    }
                        catch (Exception) { }
                }
            }
            return result;

            //int result = 0;
            //using (MySqlDatabase db = new MySqlDatabase(connString))
            //{
            //    var cmd = db.Connection.CreateCommand() as MySqlCommand;
            //    cmd.CommandText = @"insert into following (userid, followingid) values (@userid, @followingid)";
            //    cmd.Parameters.AddWithValue("@userid", profileFollowingDTO.userid);
            //    cmd.Parameters.AddWithValue("@followingid", profileFollowingDTO.followingid);

            //    result = cmd.ExecuteNonQuery();
            //    try
            //    {
            //        if (result == 1)
            //        {
            //            cmd = db.Connection.CreateCommand() as MySqlCommand;
            //            cmd.CommandText = @"insert into notification (userid, notificationto,notification,notificationdate) values (@userid,@notificationto,2,now())";
            //            cmd.Parameters.AddWithValue("@userid", profileFollowingDTO.userid);
            //            cmd.Parameters.AddWithValue("@notificationto", profileFollowingDTO.followingid);

            //            int result1 = cmd.ExecuteNonQuery();
            //        }
            //    }
            //    catch (Exception e) { }
            //}
            //return result;
        }

 
        public int GetFollower(string userID)
        {
            //List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();
            int follower = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT count(*) from follower where userid=" + userID;

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        follower = reader.GetFieldValue<int>(0);
                    }
            }

            return follower;
        }

        public int GetFollowing(string userID)
        {
            int following = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT count(*) from following where userid=" + userID;

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        following = reader.GetFieldValue<int>(0);
                    }
            }

            return following;
        }

        public List<NotificationDTO> Getallnotifications(string userID)
        {
            List<NotificationDTO> notificationDTO = new List<NotificationDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {               
                int result = 0;
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"update notification set readflag = 1 where userid = @userid ";
                //cmd.CommandText = @"SELECT n.userid,n.notificationto,nm.nmsg as notification,n.storyid, DATE_FORMAT(n.notificationdate, '%W %D %M %Y')  as notificationdate , u.name, if((CHAR_LENGTH(us.storytitle) >= 5) , substring(us.storytitle,1,10),us.storytitle) as storytitle FROM notification n inner join usertbl u on u.userid = n.userid  inner join notificationmsg nm on nm.nid = n.notification inner join userstory us on us.storyid = n.storyid where n.userid = @userid";
                cmd.Parameters.AddWithValue("@userid", userID);
                result = cmd.ExecuteNonQuery();

                // cmd.CommandText = @"select * from(SELECT n.notificationto, if(n.storyid is null,concat(nm.nmsg), CONCAT('""',us.storytitle,'""',' ',nm.nmsg))  as notification, if(n.storyid is null,0,n.storyid) as storyid,  DATE_FORMAT(n.notificationdate,'%Y-%m-%d %H:%i:%s')  as notificationdate,  if(n.userid = @userid,'you',u.name) as toname FROM notification n inner join usertbl u on u.userid = n.userid inner join notificationmsg nm on nm.nid = n.notification  left join userstory us on n.storyid = us.storyid  where n.userid = @userid or  n.notificationto = @userid ) d where notification  IS NOT NULL order by notificationdate desc";
                //cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"select * from(SELECT n.notificationto, if(n.storyid is null,concat(nm.nmsg), CONCAT(nm.nmsg,' ','""',us.storytitle,'""'))  as notification, if(n.storyid is null,0,n.storyid) as storyid,  DATE_FORMAT(n.notificationdate,'%Y-%m-%d %H:%i:%s')  as notificationdate,  if(n.userid = @userid,'You',u.name) as toname FROM notification n inner join usertbl u on u.userid = n.userid inner join notificationmsg nm on nm.nid = n.notification  left join userstory us on n.storyid = us.storyid  where (n.userid = @userid or  n.notificationto = @userid) ) d where notification  IS NOT NULL  and notificationto = @userid order by notificationdate desc";
                //cmd.CommandText = @"SELECT n.userid,n.notificationto,nm.nmsg as notification,n.storyid, DATE_FORMAT(n.notificationdate, '%W %D %M %Y')  as notificationdate , u.name, if((CHAR_LENGTH(us.storytitle) >= 5) , substring(us.storytitle,1,10),us.storytitle) as storytitle FROM notification n inner join usertbl u on u.userid = n.userid  inner join notificationmsg nm on nm.nid = n.notification inner join userstory us on us.storyid = n.storyid where n.userid = @userid";
                //cmd.Parameters.AddWithValue("@userid", userID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        NotificationDTO temp = new NotificationDTO
                        {
                            userid = userID,
                            notificationto = reader.GetFieldValue<string>(0),
                            notification = Convert.IsDBNull(reader["notification"]) ? "" : (string?)reader["notification"],
                            storyid = reader.GetFieldValue<int>(2),
                            notificationdate = reader.GetFieldValue<string>(3),
                            toname = reader.GetFieldValue<string>(4),
                           // storytitle = reader.GetFieldValue<string>(5),
                        };
                        notificationDTO.Add(temp);
                    }
            }

            return notificationDTO;
        }

        public int unreadnotifications(string userID)
        {
            long notificationcount = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                // cmd.CommandText = @"SELECT if(count(*) is null,0,count(*)) as ct from notification where readflag=0 and userid='" + userID +"'";
                cmd.CommandText = @"select count(*) from(SELECT n.notificationto, if(n.storyid is null,concat(nm.nmsg), CONCAT(nm.nmsg,' ','""',us.storytitle,'""'))  as notification, if(n.storyid is null,0,n.storyid) as storyid,  DATE_FORMAT(n.notificationdate,'%Y-%m-%d %H:%i:%s')  as notificationdate,  if(n.userid = @userid,'You',u.name) as toname FROM notification n inner join usertbl u on u.userid = n.userid inner join notificationmsg nm on nm.nid = n.notification  left join userstory us on n.storyid = us.storyid  where (n.userid = @userid or  n.notificationto = @userid) and  n.readflag=0 ) d where notification  IS NOT NULL  and notificationto = @userid order by notificationdate desc";
                cmd.Parameters.AddWithValue("@userid", userID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        notificationcount = reader.GetFieldValue<Int64>(0);


                    }
            }

            return int.Parse(notificationcount.ToString());
        }

        // Authentication Methods
        public bool CheckUserExists(string email)
        {
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT COUNT(*) FROM usertbl WHERE email = @email";
                cmd.Parameters.AddWithValue("@email", email);

                int count = Convert.ToInt32(cmd.ExecuteScalar());
                return count > 0;
            }
        }

        public ProfileDataDTO? GetUserByEmail(string email)
        {
            ProfileDataDTO? profileDataDTO = null;

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT userid, email, password, name, profileimg, age, interest, location, cdate FROM usertbl WHERE email = @email";
                cmd.Parameters.AddWithValue("@email", email);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        profileDataDTO = new ProfileDataDTO
                        {
                            userid = reader.IsDBNull(0) ? string.Empty : reader.GetString(0),
                            email = reader.IsDBNull(1) ? string.Empty : reader.GetString(1),
                            password = reader.IsDBNull(2) ? string.Empty : reader.GetString(2),
                            name = reader.IsDBNull(3) ? null : reader.GetString(3),
                            profileimg = reader.IsDBNull(4) ? null : reader.GetString(4),
                            age = reader.IsDBNull(5) ? null : reader.GetString(5),
                            interest = reader.IsDBNull(6) ? null : reader.GetString(6),
                            location = reader.IsDBNull(7) ? null : reader.GetString(7),
                            cdate = reader.IsDBNull(8) ? DateTime.MinValue : reader.GetDateTime(8)
                        };
                    }
            }

            return profileDataDTO;
        }

    }
}
