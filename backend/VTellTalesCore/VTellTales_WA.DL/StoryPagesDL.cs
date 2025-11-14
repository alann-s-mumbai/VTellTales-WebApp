using Microsoft.Extensions.Configuration;
using MySqlConnector;
using VTellTales_WA.DL.Interfaces;
using VTellTales_WA.DTO;
using System;
using System.Collections.Generic;
using System.IO;

namespace VTellTales_WA.DL
{
    public class StoryPagesDL : IStoryPagesDL
    {
        private readonly IConfiguration configuration;
        readonly string connString;
        public StoryPagesDL(IConfiguration _configuration)
        {
            configuration = _configuration;
            connString = configuration["ConnectionSettings:StoryBookDB"] ?? throw new InvalidOperationException("ConnectionSettings:StoryBookDB is not configured");
            //Connection = new MySqlConnection(configuration["ConnectionSettings:StoryBookDB"]);
        }

        public List<StoryPagesDTO> GetAllStoryPages()
        {
            List<StoryPagesDTO> storyPagesDTO = new List<StoryPagesDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT storyid,pageno,pagestory from storypages";


                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        StoryPagesDTO temp = new StoryPagesDTO
                        {
                            storyid = reader.GetFieldValue<int>(0),
                            pageno = reader.GetFieldValue<int>(1),
                            pagestory = reader.GetFieldValue<string>(2),
                          
                        };
                        storyPagesDTO.Add(temp);
                    }
            }

            return storyPagesDTO;
        }

        public List<StoryPagesDTO> SaveStorypage(int storyID)
        {
            List<StoryPagesDTO> storyPagesDTO = new List<StoryPagesDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT pageno,pagestory from storypages WHERE storyid=@storyID";
                cmd.Parameters.AddWithValue("@storyid", storyID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        StoryPagesDTO temp = new StoryPagesDTO
                        {
                            storyid = storyID,
                            pageno = reader.GetFieldValue<int>(0),
                            pagestory = reader.GetFieldValue<string>(1),
                           
                        };
                        storyPagesDTO.Add(temp);
                    }
            }

            return storyPagesDTO;
        }

        public int SaveStorypage(StoryPagesDTO storyPagesDTO)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"insert into storypages (storyid, pageno,storypagetype,pagestory,storyformat) values (@storyid, @pageno,@storypagetype, @pagestory,@storyformat)";
                cmd.Parameters.AddWithValue("@storyid", storyPagesDTO.storyid);
                cmd.Parameters.AddWithValue("@pageno", storyPagesDTO.pageno);
                cmd.Parameters.AddWithValue("@storypagetype", storyPagesDTO.storypagetype);
                cmd.Parameters.AddWithValue("@pagestory", storyPagesDTO.pagestory);
                cmd.Parameters.AddWithValue("@storyformat", storyPagesDTO.storyformat);


                result = cmd.ExecuteNonQuery();
            }
            return result;
        }
        public string deletestorypagefile(string storypagefile, string userid)
        {
            var dpath = Path.Combine(Path.Combine(Directory.GetCurrentDirectory(), "storydata\\") + userid + "\\" + storypagefile.Substring(storypagefile.LastIndexOf("/")));
            dpath = dpath.Replace("api.vtelltales.com", "webapp.vtelltales.com/data");
            FileInfo file = new FileInfo(dpath);
            try
            {
                if (file.Exists)//check file exsit or not.
                {
                    dpath = dpath + "::exists";
                    try
                    {
                        file.Delete();
                    }
                    catch (Exception e)
                    {
                        dpath = dpath + e.Message;
                    }

                }
            }
            catch { }
            
            return dpath ;
        }
        public int UpdateStoryPage(StoryPagesDTO storyPagesDTO)
        {
            int result = 0;
            

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT pageno,pagestory,storypagetype,pagestory from storypages WHERE storyid=@storyid and pageno=@pageno";
                cmd.Parameters.AddWithValue("@storyid", storyPagesDTO.storyid);
                cmd.Parameters.AddWithValue("@pageno", storyPagesDTO.pageno);
                var reader = cmd.ExecuteReader();
                if(reader.HasRows)
                {
                    /*try
                    {
                        reader.Read();
                        ptype = Convert.IsDBNull(reader["storypagetype"]) ? -1 : (int)reader["storypagetype"];
                        if (ptype != 0)
                        {
                            storypage = Convert.IsDBNull(reader["pagestory"]) ? "" : (string?)reader["pagestory"];
                            deletestorypagefile(storypage, storyPagesDTO.userid);
                        }
                        reader.Close();

                    }
                    catch (Exception e) { reader.Close();  string err = e.Message.ToString(); }*/

                    reader.Close();

                    cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"update storypages set storypagetype=@storypagetype,pagestory=@pagestory,storyformat=@storyformat where storyid=@storyid and pageno=@pageno";
                    cmd.Parameters.AddWithValue("@storyid", storyPagesDTO.storyid);
                    cmd.Parameters.AddWithValue("@pageno", storyPagesDTO.pageno);
                    cmd.Parameters.AddWithValue("@storypagetype", storyPagesDTO.storypagetype);
                    cmd.Parameters.AddWithValue("@pagestory", storyPagesDTO.pagestory);
                    cmd.Parameters.AddWithValue("@storyformat", storyPagesDTO.storyformat);
                }
                else
                {
                    reader.Close();
                    cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"insert into storypages (storyid, pageno,storypagetype,pagestory,storyformat) values (@storyid, @pageno,@storypagetype, @pagestory,@storyformat)";
                   cmd.Parameters.AddWithValue("@storyid", storyPagesDTO.storyid);
                    cmd.Parameters.AddWithValue("@pageno", storyPagesDTO.pageno);
                    cmd.Parameters.AddWithValue("@storypagetype", storyPagesDTO.storypagetype);
                    cmd.Parameters.AddWithValue("@pagestory", storyPagesDTO.pagestory);
                    cmd.Parameters.AddWithValue("@storyformat", storyPagesDTO.storyformat);
                }
               


                result = cmd.ExecuteNonQuery();
            }
            return result;
        }

        public int DeletemystoryPage(StoryPagesDTO storyPagesDTO)
        {
            int result = 0;
            

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT pageno,pagestory,storypagetype,pagestory from storypages WHERE storyid=@storyid and pageno=@pageno";
                cmd.Parameters.AddWithValue("@storyid", storyPagesDTO.storyid);
                cmd.Parameters.AddWithValue("@pageno", storyPagesDTO.pageno);
                var reader = cmd.ExecuteReader();
                while(reader.Read())
                {
                   /* try
                    {
                        ptype = Convert.IsDBNull(reader["storypagetype"]) ? -1 : (int)reader["storypagetype"];
                        if (ptype != 0)
                        {
                            storypage = Convert.IsDBNull(reader["pagestory"]) ? "" : (string?)reader["pagestory"];
                            deletestorypagefile(storypage, storyPagesDTO.userid);
                        }

                    }
                    catch (Exception e) { string err = e.Message.ToString(); }*/

                }

                reader.Close();
                cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"delete from storypages WHERE storyid=@storyid and pageno=@pageno";
                    cmd.Parameters.AddWithValue("@storyid", storyPagesDTO.storyid);
                    cmd.Parameters.AddWithValue("@pageno", storyPagesDTO.pageno);

                    result = cmd.ExecuteNonQuery();
              
                   
              
            }
            return result;
        }
      public int DeletemystoryPagefromadmin(StoryPagesDTO storyPagesDTO)
        {
            int result = 0;
            int result1 = 0;
            List<StoryPagesDTO> storyPagesDTOtemp = new List<StoryPagesDTO>();
            int ptype = 0;
            string storypage = "";

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT pageno,pagestory,storypagetype from storypages WHERE storyid=@storyid and pageno=@pageno";
                cmd.Parameters.AddWithValue("@storyid", storyPagesDTO.storyid);
                cmd.Parameters.AddWithValue("@pageno", storyPagesDTO.pageno);
                var reader = cmd.ExecuteReader();
                while(reader.Read())
                {
                    try
                    {
                        ptype = Convert.IsDBNull(reader["storypagetype"]) ? -1 : (int)reader["storypagetype"];
                        if (ptype != 0)
                        {
                            storypage = Convert.IsDBNull(reader["pagestory"]) ? string.Empty : (string?)reader["pagestory"] ?? string.Empty;
                            if (!string.IsNullOrEmpty(storypage))
                            {
                                deletestorypagefile(storypage, storyPagesDTO.userid);
                            }
                        }

                    }
                    catch (Exception e) { _ = e.Message; }

                }

                reader.Close();
                cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"delete from storypages WHERE storyid=@storyid and pageno=@pageno";
                cmd.Parameters.AddWithValue("@storyid", storyPagesDTO.storyid);
                cmd.Parameters.AddWithValue("@pageno", storyPagesDTO.pageno);
                result = cmd.ExecuteNonQuery();
                if(result == 1)
                {
                    try
                    {

                        cmd = db.Connection.CreateCommand() as MySqlCommand;
                        cmd.CommandText = @"SELECT pageno,pagestory,storypagetype from storypages WHERE storyid=@storyid order by pageno";
                        cmd.Parameters.AddWithValue("@storyid", storyPagesDTO.storyid);
                        reader = cmd.ExecuteReader();

                        while (reader.Read())
                        {
                            StoryPagesDTO temp = new StoryPagesDTO
                            {
                                storyid = storyPagesDTO.storyid,
                                pagestory = Convert.IsDBNull(reader["pagestory"]) ? string.Empty : (string?)reader["pagestory"] ?? string.Empty,
                                storypagetype = Convert.IsDBNull(reader["storypagetype"]) ? 0 : (int)reader["storypagetype"],
                                pageno = reader.IsDBNull(0) ? 0 : reader.GetInt32(0)
                            };
                            storyPagesDTOtemp.Add(temp);


                        }
                        reader.Close();
                    }
                    catch (Exception) { }
                    int i = 1;
                    try
                    {
                        foreach (StoryPagesDTO spd in storyPagesDTOtemp)
                        {
                            cmd = db.Connection.CreateCommand() as MySqlCommand;
                            cmd.CommandText = @"update storypages set pageno=@pageno where storyid=@storyid and storypagetype=@storypagetype and pagestory=@pagestory";
                            cmd.Parameters.AddWithValue("@storyid", spd.storyid);
                            cmd.Parameters.AddWithValue("@pageno", i);
                            cmd.Parameters.AddWithValue("@storypagetype", spd.storypagetype);
                            cmd.Parameters.AddWithValue("@pagestory", spd.pagestory);
                            result1 = cmd.ExecuteNonQuery();
                            i++;
                        }
                    }
                    catch (Exception) { }
                }            
                
                   
              
            }
            return result;
        }
        public List<StoryPagesDTO> GetStoryPages(int storyID)
        {
            List<StoryPagesDTO> storyPagesDTO = new List<StoryPagesDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT pageno,storypagetype,pagestory,storyformat from storypages WHERE storyid=@storyID order by pageno asc";
                cmd.Parameters.AddWithValue("@storyid", storyID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        StoryPagesDTO temp = new StoryPagesDTO
                        {
                            storyid = storyID,
                            pageno = reader.GetInt32(0),
                            storypagetype = reader.GetInt32(1),
                            pagestory = Convert.IsDBNull(reader["pagestory"]) ? string.Empty : (string?)reader["pagestory"] ?? string.Empty,
                            storyformat = reader.IsDBNull(reader.GetOrdinal("storyformat")) ? string.Empty : reader.GetString(3),
                        };
                        storyPagesDTO.Add(temp);
                    }
            }

            return storyPagesDTO;
        }

        public StoryPagesDTO? GetStoryPage(int storyID)
        {
            StoryPagesDTO? storyPagesDTO = null;

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT storyid,pageno,pagestory FROM storypages WHERE storyid=@storyid";
                cmd.Parameters.AddWithValue("@storyid", storyID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        storyPagesDTO = new StoryPagesDTO
                        {
                            storyid = storyID,
                            pageno = reader.GetInt32(0),
                            pagestory = Convert.IsDBNull(reader["pagestory"]) ? string.Empty : (string?)reader["pagestory"] ?? string.Empty,
                        };
                    }
            }

            return storyPagesDTO;
        }



    }
}
