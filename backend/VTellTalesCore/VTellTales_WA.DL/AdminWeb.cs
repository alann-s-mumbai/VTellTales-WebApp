using Microsoft.Extensions.Configuration;
using MySqlConnector;
using VTellTales_WA.DL.Interfaces;
using VTellTales_WA.DTO;
using System;
using System.Collections.Generic;
using System.Text;

namespace VTellTales_WA.DL
{
    public class AdminWeb : IAdminWeb
    {
        private readonly IConfiguration configuration;
        readonly string connString;
        public AdminWeb(IConfiguration _configuration)
        {
            configuration = _configuration;
            connString = configuration["ConnectionSettings:StoryBookDB"] ?? throw new InvalidOperationException("ConnectionSettings:StoryBookDB is not configured");
            //Connection = new MySqlConnection(configuration["ConnectionSettings:StoryBookDB"]);
        }

        public List<ProfileDataDTO> Getallusers()
        {
            List<ProfileDataDTO> profileDataDTO = new List<ProfileDataDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"select b.userid,email,b.name,age,interest,location,story,if(fanof is null,0,fanof) as fanof,if(fanclub is null,0,fanclub) as fanclub,cdate,profileimg,blockbyadmin  from (select u.userid as userid,name,email,age,interest,location,cdate,profileimg ,count(storyid) as story,blockbyadmin from usertbl u left join userstory us on u.userid=us.userid group by userid)b left join (select f.followingid,count(*) as fanclub from following f inner join usertbl bb where followingid=bb.userid group by f.followingid)f on f.followingid = b.userid left join (select f.userid,count(*) as fanof from following f inner join usertbl bb where f.userid=bb.userid group by f.userid)fa on fa.userid = b.userid order by cdate desc";

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        try
                        {
                            ProfileDataDTO temp = new ProfileDataDTO
                            {
                                userid = reader.GetFieldValue<string>(0),
                                email = reader.GetFieldValue<string>(1),
                                name = Convert.IsDBNull(reader["name"]) ? null : (string?)reader["name"],
                                age = Convert.IsDBNull(reader["age"]) ? "" : (string?)reader["age"],
                                interest = Convert.IsDBNull(reader["interest"]) ? null : (string?)reader["interest"],
                                location = Convert.IsDBNull(reader["location"]) ? null : (string?)reader["location"],
                                stories = Convert.IsDBNull(reader["story"]) ? 0 : (Int64)reader["story"],
                                following = Convert.IsDBNull(reader["fanof"]) ? 0 : (Int64)reader["fanof"],
                                follower = Convert.IsDBNull(reader["fanclub"]) ? 0 : (Int64)reader["fanclub"],
                                cdate = Convert.IsDBNull(reader["cdate"]) ? default : (DateTime)reader["cdate"],
                                profileimg = Convert.IsDBNull(reader["profileimg"]) ? "" : (string?)reader["profileimg"],
                                blockbyadmin = Convert.IsDBNull(reader["blockbyadmin"]) ? 0 : (int)reader["blockbyadmin"],

                            };
                            profileDataDTO.Add(temp);
                        }
                        catch { }
                    }

            }

            return profileDataDTO;
        }
        public List<ProfileADataDTO> GetallusersTest()
        {
            List<ProfileADataDTO> profileDataDTO = new List<ProfileADataDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
               //// cmd.CommandText = @"SELECT email,age,interest,location,cdate,name,profileimg,a.fan,b.fanof,d.storycount,u.userid  FROM usertbl u inner join (select f.followingid,count(*) as fan from following f " +
                 //               "where followingid=userid)a inner join (select f.userid,count(*) as fanof from following f where userid=userid)b inner join (select if(count(*)>0,1,0) as fanflag from following f " +
                   //             "where followingid=userid and userid=followingid)c inner join (select count(*) as storycount from userstory where userid=userid)d limit 2";
                cmd.CommandText = @"SELECT email,u.userid  FROM usertbl u inner join (select f.followingid,count(*) as fan from following f " +
                                "where followingid=userid)a inner join (select f.userid,count(*) as fanof from following f where userid=userid)b inner join (select if(count(*)>0,1,0) as fanflag from following f " +
                                "where followingid=userid and userid=followingid)c inner join (select count(*) as storycount from userstory where userid=userid)d limit 2";


                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        ProfileADataDTO temp = new ProfileADataDTO
                        {
                            userid = reader.GetFieldValue<string>(1),
                            email = reader.GetFieldValue<string>(0)
                           /* name = reader.GetFieldValue<string>(5)
                            /*age = Convert.IsDBNull(reader["age"]) ? "" : (string?)reader["age"],
                            interest = reader.GetFieldValue<string>(2),
                            location = Convert.IsDBNull(reader["location"]) ? null : (string?)reader["location"],
                            cdate = reader.GetFieldValue<DateTime>(4),
                            name = reader.GetFieldValue<string>(5),
                            profileimg = Convert.IsDBNull(reader["profileimg"]) ? "" : (string?)reader["profileimg"],
                            following = reader.GetFieldValue<Int64>(7),
                            follower = reader.GetFieldValue<Int64>(8),
                            stories = reader.GetFieldValue<Int64>(9)*/
                        };
                        profileDataDTO.Add(temp);
                    }

            }

            return profileDataDTO;
        }

        public AdminDashboardCard GetAdminDashboardCard()
        {
            AdminDashboardCard adminDashboardCard = new AdminDashboardCard();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"select * from (select count(u.userid) as totalusers from usertbl u )a join (select count(us.storyid) as stories from userstory us)b join (select count(u.userid) as newusers from usertbl u where cdate >= (NOW() - INTERVAL 1 MONTH))c join (select count(us.storyid) as newstories from userstory us  where createdate >= (NOW() - INTERVAL 1 MONTH))d";


                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        adminDashboardCard.totalusers = reader.GetFieldValue<Int64>(0);
                        adminDashboardCard.totalstories = reader.GetFieldValue<Int64>(1);
                        adminDashboardCard.newusers = reader.GetFieldValue<Int64>(2);
                        adminDashboardCard.newstories = reader.GetFieldValue<Int64>(3);
                    }

            }

            return adminDashboardCard;
        }

        public List<AdminAllStories> GetAdminAllStories()
        {
            List<AdminAllStories> adminAllStories = new List<AdminAllStories>();
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"select ut.userid,us.storyid,us.storytitle,us.storydesc,us.storyimg,us.storystatus,if(e.sttype is null,'',e.sttype) as stype,us.createdate, ut.email,ut.name,if(a.svi is null,0,a.svi) as sview,if(b.sli is null,0,b.sli) as slike,if(c.spag is null,0,c.spag) as spages,if(d.comt is null,0,d.comt) as scomments,reportblockCflag from userstory us inner join usertbl ut on us.userid=ut.userid left join (select count(storyviewbyid) as svi ,storyid from storyview sv  group by sv.storyid)a on a.storyid = us.storyid  left join (select count(likebyid) as sli ,storyid from storylike sl  group by sl.storyid)b on b.storyid = us.storyid left join (select count(pageno) as spag ,storyid from storypages sp  group by sp.storyid)c on c.storyid = us.storyid  left join (select count(comment) as comt ,storyid from comments ct  group by ct.storyid)d on d.storyid = us.storyid left join (select stid,sttype from storytypes sty)e on e.stid = us.storytype 
left join (select reportblockstoryid,reportblockCflag from reportblockcontent ru )f on f.reportblockstoryid  = us.storyid  group by us.storyid order by  us.storyid desc";

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        var userid = reader.IsDBNull(0) ? string.Empty : reader.GetString(0);
                        var storytitle = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
                        var storytype = reader.IsDBNull(6) ? string.Empty : reader.GetString(6);
                        var email = reader.IsDBNull(8) ? string.Empty : reader.GetString(8);
                        
                        AdminAllStories temp = new AdminAllStories
                        {
                            userid = userid,
                            storyid = reader.GetInt32(1),
                            storytitle = storytitle,
                            storydesc = Convert.IsDBNull(reader["storydesc"]) ? string.Empty : (string?)reader["storydesc"] ?? string.Empty,
                            storyimg = Convert.IsDBNull(reader["storyimg"]) ? string.Empty : (string?)reader["storyimg"] ?? string.Empty,
                            storystatus = reader.GetInt32(5),
                            storytype = storytype,
                            createdate = reader.IsDBNull(7) ? DateTime.MinValue : reader.GetDateTime(7),
                            email = email,
                            name = Convert.IsDBNull(reader["name"]) ? string.Empty : (string?)reader["name"] ?? string.Empty,
                            storyview = reader.IsDBNull(10) ? 0 : reader.GetInt64(10),
                            storylike = reader.GetFieldValue<Int64>(11),
                            storypages = reader.GetFieldValue<Int64>(12),
                            storycomment = reader.GetFieldValue<Int64>(13),
                            reportblockc = Convert.IsDBNull(reader["reportblockCflag"]) ? 0 : (int)reader["reportblockCflag"],

                        };
                        adminAllStories.Add(temp);
                    }

            }
            return adminAllStories;
        }

        public AdminLoginDTO AdminGetprofile(int adminid)
        {
            AdminLoginDTO adminLoginDTO = new AdminLoginDTO();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"select admin_id,admin_email,adminuname,admin_role,is_active,cdate,udate from admin_login where admin_id = @admin_id ";
                cmd.Parameters.AddWithValue("@admin_id", adminid);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        adminLoginDTO.admin_id = reader.GetFieldValue<int>(0);
                        adminLoginDTO.admin_email = reader.GetFieldValue<string>(1);                        
                        adminLoginDTO.adminuname = reader.GetFieldValue<string>(2);
                        adminLoginDTO.admin_role = reader.GetFieldValue<string>(3);
                        adminLoginDTO.is_active = reader.GetFieldValue<int>(4);
                        adminLoginDTO.cdate = reader.GetFieldValue<DateTime>(5);
                        adminLoginDTO.udate = reader.GetFieldValue<DateTime>(6);

                    }

            }

            return adminLoginDTO;

        }

        public AdminLoginDTO AdminGetlogin(AdminLoginDTO _AdminLoginDTO)
        {
            int result = 0;
            AdminLoginDTO adminLoginDTO = new AdminLoginDTO();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT count(*)  FROM admin_login WHERE admin_email=@email and admin_password=@password and admin_role = @role";
                cmd.Parameters.AddWithValue("@email", _AdminLoginDTO.admin_email);
                cmd.Parameters.AddWithValue("@password", _AdminLoginDTO.admin_password);
                cmd.Parameters.AddWithValue("@role", _AdminLoginDTO.admin_role);

                result = Convert.ToInt32(cmd.ExecuteScalar());
                if(result == 1)
                {
                    //cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"select admin_id,admin_email,adminuname,admin_role,is_active,cdate,udate from admin_login where admin_email = @email and admin_password = @password and admin_role = @role";
                    //cmd.Parameters.AddWithValue("@email", _AdminLoginDTO.admin_email);
                    //cmd.Parameters.AddWithValue("@password", _AdminLoginDTO.admin_password);

                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            adminLoginDTO.admin_id = reader.GetFieldValue<int>(0);
                            adminLoginDTO.admin_email = reader.GetFieldValue<string>(1);
                            adminLoginDTO.adminuname = reader.GetFieldValue<string>(2);
                            adminLoginDTO.admin_role = reader.GetFieldValue<string>(3);
                            adminLoginDTO.is_active = reader.GetFieldValue<int>(4);
                            adminLoginDTO.cdate = reader.GetFieldValue<DateTime>(5);
                            adminLoginDTO.udate = reader.GetFieldValue<DateTime>(6);

                        }
                    }
                      

                }
            }
            
            return adminLoginDTO;

        }
        public int AdminChangePassword(AdminLoginDTO _AdminLoginDTO)
        {
            int result = 0;

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT count(*)  FROM admin_login WHERE admin_id=@admin_id and admin_password=@admin_password";
                cmd.Parameters.AddWithValue("@admin_id", _AdminLoginDTO. admin_id);
                cmd.Parameters.AddWithValue("@admin_password", _AdminLoginDTO.admin_password);
                result = Convert.ToInt32(cmd.ExecuteScalar());
                if(result ==1)
                {
                    cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"update admin_login set admin_password=@admin_password , udate=now() WHERE admin_id=@admin_id  ";
                    cmd.Parameters.AddWithValue("@admin_id", _AdminLoginDTO.admin_id);
                    cmd.Parameters.AddWithValue("@admin_password", _AdminLoginDTO.new_password);
                    //result = Convert.ToInt32(cmd.ExecuteScalar());
                    result = cmd.ExecuteNonQuery();
                }
            }
            return result;

        }
        public int AddAdminUserRole(AdminLoginDTO _AdminLoginDTO)
        {
            int result = 0;

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT count(*) FROM admin_login WHERE admin_email=@admin_email";
                cmd.Parameters.AddWithValue("@admin_email", _AdminLoginDTO.admin_email);                
                result = Convert.ToInt32(cmd.ExecuteScalar());
                if (result == 0)
                {
                   
                    cmd.CommandText = @"insert into admin_login (admin_email,admin_password,adminuname,admin_role) values(@admin_email,@admin_password,@adminuname,@admin_role)";
                    //cmd.Parameters.AddWithValue("@admin_email", _AdminLoginDTO.admin_email);
                    cmd.Parameters.AddWithValue("@admin_password", _AdminLoginDTO.admin_password);
                    cmd.Parameters.AddWithValue("@adminuname", _AdminLoginDTO.adminuname);
                    cmd.Parameters.AddWithValue("@admin_role", _AdminLoginDTO.admin_role);
                    result = Convert.ToInt32(cmd.ExecuteScalar());
                }
                else
                {
                    result = 2;
                }
            }
            return result;

        }


        public int updatestorystatusbyadmin(StoryDataDTO storyDataDTO)
        {
            int result = 0;
            string sid = "";
            string dt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                try
                {
                    var cmd = db.Connection.CreateCommand() as MySqlCommand;

                        cmd.CommandText = @"update userstory set storystatus = @storystatus where storyid=@storyid";


                    cmd.Parameters.AddWithValue("@storyid", storyDataDTO.storyid);
                    cmd.Parameters.AddWithValue("@storystatus", storyDataDTO.storystatus);

                    result = cmd.ExecuteNonQuery();
                }
                catch (Exception e)
                {
                    sid = e.Message;
                }

            }
            if (result == 1)
            {
                    try
                    {
                    using (MySqlDatabase db = new MySqlDatabase(connString))
                    {
                        var cmd = db.Connection.CreateCommand() as MySqlCommand;
                        cmd.CommandText = @"insert into notification (userid, notificationto,notification,storyid,notificationdate) values (@userid,@notificationto,@notification,@storyid,NOW())";
                        cmd.Parameters.AddWithValue("@userid", storyDataDTO.userid);
                        cmd.Parameters.AddWithValue("@notificationto", storyDataDTO.userid);
                        if (storyDataDTO.storystatus == 2)
                            cmd.Parameters.AddWithValue("@notification", 9);
                        else if (storyDataDTO.storystatus == 3)
                            cmd.Parameters.AddWithValue("@notification", 10);

                        cmd.Parameters.AddWithValue("@storyid", storyDataDTO.storyid);
                        //cmd.Parameters.AddWithValue("@createdate", dt);

                        int result1 = cmd.ExecuteNonQuery();
                    }
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e.Message.ToString());
                    }
              

            }

            return result;
        }

        public List<AdminStoryCommentDTO> GetAdminStoryComments(int storyID)
        {
            List<AdminStoryCommentDTO> storyCommentDTO = new List<AdminStoryCommentDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"select c.userid,comment, DATE_FORMAT(comdate, '%Y-%m-%d %H:%i:%s') as comdate,name,u.profileimg,srno from comments c inner join usertbl u on u.userid=c.userid where c.storyid=@storyid ";
                cmd.Parameters.AddWithValue("@storyid", storyID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        var userid = reader.IsDBNull(0) ? string.Empty : reader.GetString(0);
                        var comdate = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
                        var uname = reader.IsDBNull(3) ? string.Empty : reader.GetString(3);
                        
                        AdminStoryCommentDTO temp = new AdminStoryCommentDTO
                        {
                            storyid = storyID,
                            userid = userid,
                            comment = Convert.IsDBNull(reader["comment"]) ? string.Empty : (string?)reader["comment"] ?? string.Empty,
                            comdate = comdate,
                            uname = uname,
                            pimg = Convert.IsDBNull(reader["profileimg"]) ? string.Empty : (string?)reader["profileimg"] ?? string.Empty,
                            srno = reader.GetInt32(5),
                        };
                        storyCommentDTO.Add(temp);
                    }
            }

            return storyCommentDTO;
        }

        public int deletecommentbyadmin(int srno)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"delete from comments where srno=@srno";
                cmd.Parameters.AddWithValue("@srno", srno);
                result = cmd.ExecuteNonQuery();
               
            }
            return result;
        }

        public int deleteuserbyadmin(ProfileDataDTO _ProfileDataDTO)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
               
                var cmd5 = db.Connection.CreateCommand() as MySqlCommand;
                cmd5.CommandText = @"update usertbl set blockbyadmin = @blockbyadmin where userid=@userid";
                cmd5.Parameters.AddWithValue("@userid", _ProfileDataDTO.userid);
                cmd5.Parameters.AddWithValue("@blockbyadmin", _ProfileDataDTO.blockbyadmin);
                result = cmd5.ExecuteNonQuery();

                /*if(result == 1)
                {
                   // await FirebaseAuth.DefaultInstance.DeleteUserAsync(userid);
                   // Console.WriteLine("Successfully deleted user.");
                }*/

            }
            return result;
        }

        public bool VerifyAdminPassword(string admin_email, string admin_password)
        {
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT count(*) FROM admin_login WHERE admin_email=@email and admin_password=@password and is_active=1";
                cmd.Parameters.AddWithValue("@email", admin_email);
                cmd.Parameters.AddWithValue("@password", admin_password);
                
                int result = Convert.ToInt32(cmd.ExecuteScalar());
                return result == 1;
            }
        }

        public int PermanentDeleteUser(string userid, string admin_email, string admin_password)
        {
            // Verify admin password first
            if (!VerifyAdminPassword(admin_email, admin_password))
            {
                return -1; // Invalid admin credentials
            }

            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                // Start transaction for safety
                var transaction = db.Connection.BeginTransaction();
                try
                {
                    // Delete user's stories
                    var cmd1 = db.Connection.CreateCommand() as MySqlCommand;
                    cmd1.Transaction = transaction;
                    cmd1.CommandText = @"DELETE FROM storydatatbl WHERE userid=@userid";
                    cmd1.Parameters.AddWithValue("@userid", userid);
                    cmd1.ExecuteNonQuery();

                    // Delete user's story likes
                    var cmd2 = db.Connection.CreateCommand() as MySqlCommand;
                    cmd2.Transaction = transaction;
                    cmd2.CommandText = @"DELETE FROM story_liketbl WHERE userid=@userid";
                    cmd2.Parameters.AddWithValue("@userid", userid);
                    cmd2.ExecuteNonQuery();

                    // Delete user's comments
                    var cmd3 = db.Connection.CreateCommand() as MySqlCommand;
                    cmd3.Transaction = transaction;
                    cmd3.CommandText = @"DELETE FROM story_commenttbl WHERE userid=@userid";
                    cmd3.Parameters.AddWithValue("@userid", userid);
                    cmd3.ExecuteNonQuery();

                    // Delete user's bookmarks
                    var cmd4 = db.Connection.CreateCommand() as MySqlCommand;
                    cmd4.Transaction = transaction;
                    cmd4.CommandText = @"DELETE FROM bookmarktbl WHERE userid=@userid";
                    cmd4.Parameters.AddWithValue("@userid", userid);
                    cmd4.ExecuteNonQuery();

                    // Delete user's followers/following
                    var cmd5 = db.Connection.CreateCommand() as MySqlCommand;
                    cmd5.Transaction = transaction;
                    cmd5.CommandText = @"DELETE FROM followtbl WHERE userid=@userid OR followerid=@userid";
                    cmd5.Parameters.AddWithValue("@userid", userid);
                    cmd5.ExecuteNonQuery();

                    // Finally delete the user
                    var cmd6 = db.Connection.CreateCommand() as MySqlCommand;
                    cmd6.Transaction = transaction;
                    cmd6.CommandText = @"DELETE FROM usertbl WHERE userid=@userid";
                    cmd6.Parameters.AddWithValue("@userid", userid);
                    result = cmd6.ExecuteNonQuery();

                    // Commit transaction if all successful
                    transaction.Commit();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    throw new Exception("Failed to delete user: " + ex.Message);
                }
            }
            return result;
        }

        // AdminPanel Gallery data

        public List<AdminGalleryDTO> GetallGalleryDatabypage(string imgtype, string Offset, string Limit)
        {
            List<AdminGalleryDTO> adminGalleryDTO = new List<AdminGalleryDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                if (imgtype.ToString().ToLower() == "gif")
                    cmd.CommandText = @"SELECT gallery_id,filepath,filetype,size,tags,cdate,udate  FROM gallery where filetype like '%" + imgtype + "' order by  cdate desc  limit @pagelimit offset @pageOffset";
                else if (imgtype.ToString().ToLower() == "all")
                    cmd.CommandText = @"SELECT gallery_id,filepath,filetype,size,tags,cdate,udate  FROM gallery order by  cdate desc  limit @pagelimit offset @pageOffset";
                else
                    cmd.CommandText = @"SELECT gallery_id,filepath,filetype,size,tags,cdate,udate  FROM gallery where filetype not like  '%gif' order by  cdate desc  limit @pagelimit offset @pageOffset";

                int offset = (int.Parse(Offset));
                cmd.Parameters.AddWithValue("@pagelimit", int.Parse(Limit));
                cmd.Parameters.AddWithValue("@pageOffset", offset);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        var galleryId = reader.GetInt32(0);
                        
                        AdminGalleryDTO temp = new AdminGalleryDTO
                        {
                            gallery_id = galleryId,
                            filepath = Convert.IsDBNull(reader["filepath"]) ? string.Empty : (string?)reader["filepath"] ?? string.Empty,
                            filetype = Convert.IsDBNull(reader["filetype"]) ? string.Empty : (string?)reader["filetype"] ?? string.Empty,
                            size = Convert.IsDBNull(reader["size"]) ? string.Empty : (string?)reader["size"] ?? string.Empty,
                            tags = Convert.IsDBNull(reader["tags"]) ? string.Empty : (string?)reader["tags"] ?? string.Empty,
                            cdate = Convert.IsDBNull(reader["cdate"]) ? DateTime.MinValue : reader.GetDateTime("cdate"),
                            udate = Convert.IsDBNull(reader["udate"]) ? DateTime.MinValue : reader.GetDateTime("udate")
                        };

                        adminGalleryDTO.Add(temp);
                    }
            }

            return adminGalleryDTO;
        }
        public List<AdminGalleryDTO> GetallGalleryData(string imgtype)
        {
            List<AdminGalleryDTO> adminGalleryDTO = new List<AdminGalleryDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                if(imgtype.ToString().ToLower() == "gif")
                    cmd.CommandText = @"SELECT gallery_id,filepath,filetype,size,tags,cdate,udate  FROM gallery where filetype like '%"+ imgtype + "' order by  cdate desc";
                else if (imgtype.ToString().ToLower() == "all")
                    cmd.CommandText = @"SELECT gallery_id,filepath,filetype,size,tags,cdate,udate  FROM gallery order by  cdate desc ";
                else
                    cmd.CommandText = @"SELECT gallery_id,filepath,filetype,size,tags,cdate,udate  FROM gallery where filetype not like  '%gif' order by  cdate desc";


                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        var gallery_id = reader.GetInt32(0);
                        
                        AdminGalleryDTO temp = new AdminGalleryDTO
                        {
                            gallery_id = gallery_id,
                            filepath = Convert.IsDBNull(reader["filepath"]) ? string.Empty : (string?)reader["filepath"] ?? string.Empty,
                            filetype = Convert.IsDBNull(reader["filetype"]) ? string.Empty : (string?)reader["filetype"] ?? string.Empty,
                            size = Convert.IsDBNull(reader["size"]) ? string.Empty : (string?)reader["size"] ?? string.Empty,
                            tags = Convert.IsDBNull(reader["tags"]) ? string.Empty : (string?)reader["tags"] ?? string.Empty,
                            cdate = Convert.IsDBNull(reader["cdate"]) ? DateTime.MinValue : reader.GetDateTime("cdate"),
                            udate = Convert.IsDBNull(reader["udate"]) ? DateTime.MinValue : reader.GetDateTime("udate")
                        };

                        adminGalleryDTO.Add(temp);
                    }
            }

            return adminGalleryDTO;
        }

        public int AddGalleryData(AdminGalleryDTO adminGalleryDTO)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"insert into gallery (filepath,filetype,size, tags) values (@filepath,@filetype,@size, @tags)";

                cmd.Parameters.AddWithValue("@filepath", adminGalleryDTO.filepath);
                cmd.Parameters.AddWithValue("@filetype", adminGalleryDTO.filetype);
                cmd.Parameters.AddWithValue("@size", adminGalleryDTO.size);
                cmd.Parameters.AddWithValue("@tags", adminGalleryDTO.tags);
                result = cmd.ExecuteNonQuery();
            }
            return result;
        }

        public int UpdateGalleryData(AdminGalleryDTO adminGalleryDTO)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                if (adminGalleryDTO.filepath != null)
                    cmd.CommandText = @"Update gallery set filetype =@filetype,size=@size, tags=@tags, filepath=@filepath, udate=now() where gallery_id = @gallery_id";
                else
                {
                    cmd.CommandText = @"Update gallery set tags=@tags, udate=CURDATE() where gallery_id = @gallery_id";

                }
                cmd.Parameters.AddWithValue("@gallery_id", adminGalleryDTO.gallery_id);
                cmd.Parameters.AddWithValue("@tags", adminGalleryDTO.tags);

                if (adminGalleryDTO.filepath != null)
                {
                    cmd.Parameters.AddWithValue("@filepath", adminGalleryDTO.filepath);
                    cmd.Parameters.AddWithValue("@filetype", adminGalleryDTO.filetype);
                    cmd.Parameters.AddWithValue("@size", adminGalleryDTO.size);
                }
                result = cmd.ExecuteNonQuery();

            }
            return result;
        }

        public int DeleteGalleryData(int gallery_id)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"delete from gallery where gallery_id = @gallery_id";
                cmd.Parameters.AddWithValue("@gallery_id", gallery_id);
                result = cmd.ExecuteNonQuery();
            }
            return result;
        }

        // Password Reset Methods
        public AdminLoginDTO GetAdminByEmail(string email)
        {
            AdminLoginDTO? admin = null;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT admin_id, admin_email, admin_role 
                                   FROM admin_login 
                                   WHERE admin_email = @email";
                cmd.Parameters.AddWithValue("@email", email);
                
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        admin = new AdminLoginDTO
                        {
                            admin_id = Convert.ToInt32(reader["admin_id"]),
                            admin_email = reader["admin_email"]?.ToString() ?? "",
                            admin_role = reader["admin_role"]?.ToString() ?? ""
                        };
                    }
                }
            }
            return admin!;
        }

        public bool SavePasswordResetToken(string email, string resetToken, DateTime tokenExpiry)
        {
            try
            {
                using (MySqlDatabase db = new MySqlDatabase(connString))
                {
                    var cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"UPDATE admin_login 
                                       SET reset_token = @token, 
                                           reset_token_expiry = @expiry,
                                           reset_requested_at = NOW(),
                                           reset_count = reset_count + 1
                                       WHERE admin_email = @email";
                    cmd.Parameters.AddWithValue("@token", resetToken);
                    cmd.Parameters.AddWithValue("@expiry", tokenExpiry);
                    cmd.Parameters.AddWithValue("@email", email);
                    
                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
            catch (Exception)
            {
                return false;
            }
        }

        public string ValidateResetToken(string resetToken)
        {
            string? adminEmail = null;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT admin_email 
                                   FROM admin_login 
                                   WHERE reset_token = @token 
                                   AND reset_token_expiry > NOW()";
                cmd.Parameters.AddWithValue("@token", resetToken);
                
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        adminEmail = reader["admin_email"]?.ToString() ?? "";
                    }
                }
            }
            return adminEmail ?? "";
        }

        public bool UpdateAdminPassword(string email, string newPassword)
        {
            try
            {
                using (MySqlDatabase db = new MySqlDatabase(connString))
                {
                    var cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"UPDATE admin_login 
                                       SET admin_password = @password 
                                       WHERE admin_email = @email";
                    cmd.Parameters.AddWithValue("@password", newPassword);
                    cmd.Parameters.AddWithValue("@email", email);
                    
                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool ClearPasswordResetToken(string email)
        {
            try
            {
                using (MySqlDatabase db = new MySqlDatabase(connString))
                {
                    var cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"UPDATE admin_login 
                                       SET reset_token = NULL, 
                                           reset_token_expiry = NULL 
                                       WHERE admin_email = @email";
                    cmd.Parameters.AddWithValue("@email", email);
                    
                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
