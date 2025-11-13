using Microsoft.Extensions.Configuration;
using MySqlConnector;
using VTellTales_WA.DL.Interfaces;
using VTellTales_WA.DTO;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;

namespace VTellTales_WA.DL
{
    public class StoryDataDL : IStoryDataDL
    {
        private readonly IConfiguration configuration;
        readonly string connString;
        public StoryDataDL(IConfiguration _configuration)
        {
            configuration = _configuration;
            connString = configuration["ConnectionSettings:StoryBookDB"] ?? throw new InvalidOperationException("ConnectionSettings:StoryBookDB is not configured");
            //Connection = new MySqlConnection(configuration["ConnectionSettings:StoryBookDB"]);
        }
        public ProfileDataDTO? GetStoryUser(int storyid)
        {
            ProfileDataDTO? profileDataDTO = null;

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT userid FROM userstory WHERE storyid=@storyid";
                cmd.Parameters.AddWithValue("@storyid", storyid);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        profileDataDTO = new ProfileDataDTO
                        {
                            userid = reader.GetFieldValue<string>(0),
                            
                        };
                    }
            }

            return profileDataDTO;
        }
        public StoryDataDTO? GetStory(string userID, int storyID)
        {
            StoryDataDTO? storyDataDTO = null;

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT storytitle,storydesc,storylike,storyimg,storystatus,storypages, DATE_FORMAT(createdate, '%Y-%m-%d %H:%i:%s')   as createdate  FROM userstory WHERE userid=@userid and storyid=@storyid";
                cmd.Parameters.AddWithValue("@userid", userID);
                cmd.Parameters.AddWithValue("@storyid", storyID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        storyDataDTO = new StoryDataDTO
                        {
                            userid = userID,
                            storyid = storyID,
                            storytitle = reader.GetFieldValue<string>(0),
                            storydesc = Convert.IsDBNull(reader["storydesc"]) ? "" : (string?)reader["storydesc"],
                            storylike = reader.GetFieldValue<int>(2) as int? ?? default(int),
                            storyimg = Convert.IsDBNull(reader["storyimg"]) ? null : (string?)reader["storyimg"],
                            storystatus = reader.GetFieldValue<int>(4),
                            storypages = reader.GetFieldValue<int>(5),
                            createdate = reader.GetFieldValue<DateTime>(6),
                        };
                    }
            }

            return storyDataDTO; // new StoryDataDTO { UserID = userID, StoryText = "My Sample Story" };
        }
        public List<StoryTypeDataDTO> Getallstorytype()
        {
            List<StoryTypeDataDTO> storyTypeDataDTO = new List<StoryTypeDataDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT stid,sttype from storytypes ";


                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        var stid = reader.GetInt32(0);
                        var sttype = Convert.IsDBNull(reader["sttype"]) ? string.Empty : (string?)reader["sttype"] ?? string.Empty;
                        
                        StoryTypeDataDTO temp = new StoryTypeDataDTO
                        {
                            stid = stid,
                            sttype = sttype
                        };
                        storyTypeDataDTO.Add(temp);
                    }
            }

            return storyTypeDataDTO;
        }

        public int Addstorytype(StoryTypeDataDTO _StoryTypeDataDTO)
        {
            int result = 0;

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"insert into storytypes (sttype) values (@sttype)";                
                cmd.Parameters.AddWithValue("@sttype", _StoryTypeDataDTO.sttype);               
                result = cmd.ExecuteNonQuery();
            }

            return result;
        }
        public int Updatestorytype(StoryTypeDataDTO _StoryTypeDataDTO)
        {
            int result = 0;

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"update storytypes set sttype=@sttype where stid=@stid";
                cmd.Parameters.AddWithValue("@stid", _StoryTypeDataDTO.stid);
                cmd.Parameters.AddWithValue("@sttype", _StoryTypeDataDTO.sttype);
                result = cmd.ExecuteNonQuery();
            }

            return result;
        }


        public int Deletestorytype(StoryTypeDataDTO _StoryTypeDataDTO)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"delete from storytypes where stid=@stid";
                cmd.Parameters.AddWithValue("@stid", _StoryTypeDataDTO.stid);
                result = cmd.ExecuteNonQuery();
               
            }
            return result;
        }

        public List<StoryDataDTO> GetAllStories(string userID)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                // admin approded 2 cmd.CommandText= @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (c.count is NULL,0,c.count) as storylike,if (co.cmt is NULL,0,co.cmt) as storycomment,if (vi.vw is NULL,0,vi.vw) as storyview,v.i as storyimg, v.uu as userid, v.n as name, DATE_FORMAT(v.cd, '%Y-%m-%d %H:%i:%s') as createdate,if (il.islike is null,0,il.islike) as islike,v.uu as userid from(SELECT u.storyid as a, u.storytitle as t, u.storydesc as d, u.storyimg as i, ut.userid as uu, ut.name as n,u.createdate as cd FROM userstory u inner join usertbl ut on u.userid = ut.userid where u.userid != @userid  and u.storystatus = 2)v left join(select storyid, count(*) as count  from storylike group by storyid)c on v.a = c.storyid left join(select storyid, count(*) as cmt  from comments group by storyid)co on v.a = co.storyid left join(select storyid, count(*) as vw  from storyview group by storyid)vi on v.a = vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid order by v.a desc";
               // cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (c.count is NULL,0,c.count) as storylike,if (co.cmt is NULL,0,co.cmt) as storycomment,if (vi.vw is NULL,0,vi.vw) as storyview,v.i as storyimg, v.uu as userid, v.n as name, DATE_FORMAT(v.cd, '%Y-%m-%d %H:%i:%s') as createdate,if (il.islike is null,0,il.islike) as islike,v.uu as userid from(SELECT u.storyid as a, u.storytitle as t, u.storydesc as d, u.storyimg as i, ut.userid as uu, ut.name as n,u.createdate as cd FROM userstory u inner join usertbl ut on u.userid = ut.userid where u.userid != @userid  and u.storystatus = 1)v left join(select storyid, count(*) as count  from storylike group by storyid)c on v.a = c.storyid left join(select storyid, count(*) as cmt  from comments group by storyid)co on v.a = co.storyid left join(select storyid, count(*) as vw  from storyview group by storyid)vi on v.a = vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid order by v.a desc";
                 cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spage,if (c.count is NULL,0,c.count) as storylike,if (co.cmt is NULL,0,co.cmt) as storycomment,if (vi.vw is NULL,0,vi.vw) as storyview,v.i as storyimg, v.uu as userid, v.n as name, DATE_FORMAT(v.cd, '%Y-%m-%d %H:%i:%s') as createdate,if (il.islike is null,0,il.islike) as islike,v.uu as userid from(SELECT u.storyid as a, u.storytitle as t, u.storydesc as d, u.storyimg as i, ut.userid as uu, ut.name as n,u.createdate as cd FROM userstory u inner join usertbl ut on u.userid = ut.userid where u.userid != @userid and u.userid not in(select reportblockuser from reportblockuser ru where  ru.userid = @userid  and ru.reportblockflag=2) and u.storyid not in(select reportblockstoryid from reportblockcontent ru where  ru.userid = @userid and ru.reportblockCflag = 2) and u.storystatus = 1)v left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid left join(select storyid, count(*) as count  from storylike group by storyid)c on v.a = c.storyid left join(select storyid, count(*) as cmt  from comments group by storyid)co on v.a = co.storyid left join(select storyid, count(*) as vw  from storyview group by storyid)vi on v.a = vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid order by v.a desc";
      
                cmd.Parameters.AddWithValue("@userid", userID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        StoryDataDTO temp = new StoryDataDTO
                        {
                            userid = userID,
                            storyid = reader.GetFieldValue<int>(0),
                            storytitle = reader.GetFieldValue<string>(1),
                            storydesc = Convert.IsDBNull(reader["storydesc"]) ? "" : (string?)reader["storydesc"],
                            spages = (int)reader.GetFieldValue<long>(3),
                            storylike = (int)reader.GetFieldValue<long>(4),
                            storycomment = (int)reader.GetFieldValue<long>(5),
                            storyview = (int)reader.GetFieldValue<long>(6),
                            storyimg = Convert.IsDBNull(reader["storyimg"]) ? null : (string?)reader["storyimg"],
                            followingid = reader.GetFieldValue<string>(8),
                            followingname = reader.GetFieldValue<string>(9),
                            createdate = Convert.ToDateTime(reader.GetFieldValue<String>(10)),
                            islike = reader.GetFieldValue<int>(11) == 0 ? false : true,
                        }; 
                        storyDataDTO.Add(temp);
                    }
            }

            return storyDataDTO;
        }

        public List<StoryDataDTO> GetAllStoriesbypage(string userID, string Offset, string Limit)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
               
                //cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spage,if (c.count is NULL,0,c.count) as storylike,if (co.cmt is NULL,0,co.cmt) as storycomment,if (vi.vw is NULL,0,vi.vw) as storyview,v.i as storyimg, v.uu as userid, v.n as name, DATE_FORMAT(v.cd, '%Y-%m-%d %H:%i:%s') as createdate,if (il.islike is null,0,il.islike) as islike,v.uu as userid,sty.sttype as storytype from(SELECT u.storyid as a, u.storytitle as t, u.storydesc as d, u.storyimg as i, ut.userid as uu, ut.name as n,u.createdate as cd,u.storytype as storytype  FROM userstory u inner join usertbl ut on u.userid = ut.userid where u.userid != @userid  and u.storystatus = 1 order by cd desc limit @pagelimit offset @pageOffset)v left join (select stid,sttype from storytypes)sty on sty.stid=v.storytype left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid left join(select storyid, count(*) as count  from storylike group by storyid)c on v.a = c.storyid left join(select storyid, count(*) as cmt  from comments group by storyid)co on v.a = co.storyid left join(select storyid, count(*) as vw  from storyview group by storyid)vi on v.a = vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid order by v.a desc";
                cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spage,if (c.count is NULL,0,c.count) as storylike,if (co.cmt is NULL,0,co.cmt) as storycomment,if (vi.vw is NULL,0,vi.vw) as storyview,v.i as storyimg, v.uu as userid, v.n as name, DATE_FORMAT(v.cd, '%Y-%m-%d %H:%i:%s') as createdate,if (il.islike is null,0,il.islike) as islike,v.uu as userid,sty.sttype as storytype from(SELECT u.storyid as a, u.storytitle as t, u.storydesc as d, u.storyimg as i, ut.userid as uu, ut.name as n,u.createdate as cd,u.storytype as storytype  FROM userstory u inner join usertbl ut on u.userid = ut.userid where u.userid != @userid and u.userid not in(select reportblockuser from reportblockuser ru where  ru.userid = @userid  and ru.reportblockflag=2) and u.storyid not in(select reportblockstoryid from reportblockcontent ru where  ru.userid = @userid and ru.reportblockCflag = 2)  and u.storystatus = 1 order by cd desc limit @pagelimit offset @pageOffset)v left join (select stid,sttype from storytypes)sty on sty.stid=v.storytype left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid left join(select storyid, count(*) as count  from storylike group by storyid)c on v.a = c.storyid left join(select storyid, count(*) as cmt  from comments group by storyid)co on v.a = co.storyid left join(select storyid, count(*) as vw  from storyview group by storyid)vi on v.a = vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid order by v.a desc";


                int offset = (int.Parse(Offset));
                cmd.Parameters.AddWithValue("@userid", userID);
                cmd.Parameters.AddWithValue("@pagelimit", int.Parse(Limit));
                cmd.Parameters.AddWithValue("@pageOffset", offset);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        StoryDataDTO temp = new StoryDataDTO
                        {

                            userid = userID,
                            storyid = reader.GetFieldValue<int>(0),
                            storytitle = reader.GetFieldValue<string>(1),
                            storydesc = Convert.IsDBNull(reader["storydesc"]) ? "" : (string?)reader["storydesc"],
                            spages = (int)reader.GetFieldValue<long>(3),
                            storylike = (int)reader.GetFieldValue<long>(4),
                            storycomment = (int)reader.GetFieldValue<long>(5),
                            storyview = (int)reader.GetFieldValue<long>(6),
                            storyimg = Convert.IsDBNull(reader["storyimg"]) ? null : (string?)reader["storyimg"],
                            followingid = reader.GetFieldValue<string>(8),
                            followingname = reader.GetFieldValue<string>(9),
                            createdate = Convert.ToDateTime(reader.GetFieldValue<String>(10)),
                            islike = reader.GetFieldValue<int>(11) == 0 ? false : true,
                            storytype = Convert.IsDBNull(reader["storytype"]) ? null : (string?)reader["storytype"],
                        };
                        storyDataDTO.Add(temp);
                    }
            }

            return storyDataDTO;
        }

        public List<StoryDataDTO> GetMyStorybypage(string userID, string Offset, string Limit)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                //cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spage,if (c.count is NULL,0,c.count) as storylike,if (co.cmt is NULL,0,co.cmt) as storycomment,if (vi.vw is NULL,0,vi.vw) as storyview,v.i as storyimg, v.uu as userid, v.n as name, DATE_FORMAT(v.cd, '%Y-%m-%d %H:%i:%s') as createdate,if (il.islike is null,0,il.islike) as islike,v.uu as userid from(SELECT u.storyid as a, u.storytitle as t, u.storydesc as d, u.storyimg as i, ut.userid as uu, ut.name as n,u.createdate as cd FROM userstory u inner join usertbl ut on u.userid = ut.userid where u.userid != @userid  and u.storystatus = 1 order by cd desc limit @pagelimit offset @pageOffset)v left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid left join(select storyid, count(*) as count  from storylike group by storyid)c on v.a = c.storyid left join(select storyid, count(*) as cmt  from comments group by storyid)co on v.a = co.storyid left join(select storyid, count(*) as vw  from storyview group by storyid)vi on v.a = vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid order by v.a desc";
                //cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spages,if(c.count is NULL,0,c.count) as storylike,if(co.cmt is NULL,0,co.cmt) as storycomment,if(vi.vw is NULL,0,vi.vw) as storyview,v.i as storyimg, v.uu as userid, v.n as name, v.cd as createdate,v.storytype as storytype, v.storystatus as storystatus,if (il.islike is null,0,il.islike) as islike  from  (SELECT u.storyid as a,u.storytitle as t,u.storydesc as d,u.storyimg as i, ut.userid as uu,ut.name as n,u.createdate as cd, u.storytype as storytype, u.storystatus as storystatus FROM userstory u inner join usertbl ut on u.userid = ut.userid where u.userid = @userid  order by cd desc limit @pagelimit offset @pageOffset )v left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid left join (select storyid,count(*) as count  from storylike group by storyid)c on v.a=c.storyid left join (select storyid,count(*) as cmt  from comments group by storyid)co on v.a=co.storyid  left join (select storyid,count(*) as vw  from storyview group by storyid)vi on v.a=vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid order by v.a desc";
                cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spages,if(c.count is NULL,0,c.count) as storylike,if(co.cmt is NULL,0,co.cmt) as storycomment,if(vi.vw is NULL,0,vi.vw) as storyview,v.i as storyimg, v.uu as userid, v.n as name, v.cd as createdate, v.storystatus as storystatus,if (il.islike is null,0,il.islike) as islike,sty.sttype as storytype, v.storytype as storytypeid from  (SELECT u.storyid as a,u.storytitle as t,u.storydesc as d,u.storyimg as i, ut.userid as uu,ut.name as n,u.createdate as cd, u.storytype as storytype, u.storystatus as storystatus  FROM userstory u inner join usertbl ut on u.userid = ut.userid where u.userid = @userid  order by cd desc limit @pagelimit offset @pageOffset )v left join (select stid,sttype from storytypes)sty on sty.stid=v.storytype left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid left join (select storyid,count(*) as count  from storylike group by storyid)c on v.a=c.storyid left join (select storyid,count(*) as cmt  from comments group by storyid)co on v.a=co.storyid  left join (select storyid,count(*) as vw  from storyview group by storyid)vi on v.a=vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid order by v.a desc";

                int offset = (int.Parse(Offset));
                cmd.Parameters.AddWithValue("@userid", userID);
                cmd.Parameters.AddWithValue("@pagelimit", int.Parse(Limit));
                cmd.Parameters.AddWithValue("@pageOffset", offset);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        StoryDataDTO temp = new StoryDataDTO
                        {
                            userid = userID,
                            storyid = reader.GetFieldValue<int>(0),
                            storytitle = reader.GetFieldValue<string>(1),
                            storydesc = Convert.IsDBNull(reader["storydesc"]) ? "" : (string?)reader["storydesc"],
                            spages = (int)reader.GetFieldValue<long>(3),
                            storylike = (int)reader.GetFieldValue<long>(4),
                            storycomment = (int)reader.GetFieldValue<long>(5),
                            storyview = (int)reader.GetFieldValue<long>(6),
                            storyimg = Convert.IsDBNull(reader["storyimg"]) ? null : (string?)reader["storyimg"],
                            followingid = reader.GetFieldValue<string>(8),
                            followingname = Convert.IsDBNull(reader["name"]) ? null : (string?)reader["name"], //reader.GetFieldValue<string>(9),
                            createdate = Convert.IsDBNull(reader["createdate"]) ? default : (DateTime)reader["createdate"],
                            //storytype = reader.GetFieldValue<int>(11).ToString(),
                            storystatus = reader.GetFieldValue<int>(11),
                            islike = reader.GetFieldValue<int>(12) == 0 ? false : true,
                            storytype = Convert.IsDBNull(reader["storytype"]) ? null : (string?)reader["storytype"],
                            storytypeid = Convert.IsDBNull(reader["storytypeid"]) ? 0 : (int)reader["storytypeid"],

                            /* userid = userID,
                             storyid = reader.GetFieldValue<int>(0),
                             storytitle = reader.GetFieldValue<string>(1),
                             storydesc = Convert.IsDBNull(reader["storydesc"]) ? "" : (string?)reader["storydesc"],
                             spages = (int)reader.GetFieldValue<long>(3),
                             storylike = (int)reader.GetFieldValue<long>(4),
                             storycomment = (int)reader.GetFieldValue<long>(5),
                             storyview = (int)reader.GetFieldValue<long>(6),
                             storyimg = Convert.IsDBNull(reader["storyimg"]) ? null : (string?)reader["storyimg"],
                             followingid = reader.GetFieldValue<string>(8),
                             followingname = reader.GetFieldValue<string>(9),
                             createdate = Convert.ToDateTime(reader.GetFieldValue<String>(10)),
                             islike = reader.GetFieldValue<int>(11) == 0 ? false : true,*/
                        };
                        storyDataDTO.Add(temp);
                    }
            }

            return storyDataDTO;
        }
        public List<StoryDataDTO> Otherallstory(string userID)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
               // cmd.CommandText = @"SELECT userid,storyid,storytitle,storydesc,storylike,storyimg,storystatus,storypages,createdate from userstory WHERE userid=@userid";
                cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spages,if(c.count is NULL,0,c.count) as storylike  ,if(co.cmt is NULL,0,co.cmt) as storycomment,if(vi.vw is NULL,0,vi.vw) as storyview,v.i as storyimg, v.uu as userid, v.n as name, v.cd as createdate,v.storytype as storytype, v.storystatus as storystatus,if (il.islike is null,0,il.islike) as islike  from  (SELECT u.storyid as a,u.storytitle as t,u.storydesc as d,u.storyimg as i, ut.userid as uu,ut.name as n,u.createdate as cd, u.storytype as storytype, u.storystatus as storystatus FROM userstory u inner join usertbl ut on u.userid = ut.userid where u.userid = @userid and u.storystatus != 0)v left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid left join (select storyid,count(*) as count  from storylike group by storyid)c on v.a=c.storyid left join (select storyid,count(*) as cmt  from comments group by storyid)co on v.a=co.storyid  left join (select storyid,count(*) as vw  from storyview group by storyid)vi on v.a=vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid order by v.a desc";

                cmd.Parameters.AddWithValue("@userid", userID);
               
                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        StoryDataDTO temp = new StoryDataDTO
                        {
                            
                            userid = userID,
                            storyid = reader.GetFieldValue<int>(0),
                            storytitle = reader.GetFieldValue<string>(1),
                            storydesc = Convert.IsDBNull(reader["storydesc"]) ? "" : (string?)reader["storydesc"],
                            spages = (int)reader.GetFieldValue<long>(3),
                            storylike = (int)reader.GetFieldValue<long>(4),
                            storycomment = (int)reader.GetFieldValue<long>(5),
                            storyview = (int)reader.GetFieldValue<long>(6),
                            storyimg = Convert.IsDBNull(reader["storyimg"]) ? null : (string?)reader["storyimg"],
                            followingid = reader.GetFieldValue<string>(8),
                            followingname = reader.GetFieldValue<string>(9),
                            createdate = Convert.IsDBNull(reader["createdate"]) ? default : (DateTime)reader["createdate"],
                            storytype = reader.GetFieldValue<int>(11).ToString(),
                            storystatus = reader.GetFieldValue<int>(12),
                            islike = reader.GetFieldValue<int>(13) == 0 ? false : true,
                        };
                        storyDataDTO.Add(temp);
                    }
            }

            return storyDataDTO;
        }

        public List<StoryDataDTO> GetMyStory(string userID)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
               // cmd.CommandText = @"SELECT userid,storyid,storytitle,storydesc,storylike,storyimg,storystatus,storypages,createdate from userstory WHERE userid=@userid";
                cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spages,if(c.count is NULL,0,c.count) as storylike  ,if(co.cmt is NULL,0,co.cmt) as storycomment,if(vi.vw is NULL,0,vi.vw) as storyview,v.i as storyimg, v.uu as userid, v.n as name, v.cd as createdate,v.storytype as storytype, v.storystatus as storystatus,if (il.islike is null,0,il.islike) as islike  from  (SELECT u.storyid as a,u.storytitle as t,u.storydesc as d,u.storyimg as i, ut.userid as uu,ut.name as n,u.createdate as cd, u.storytype as storytype, u.storystatus as storystatus FROM userstory u inner join usertbl ut on u.userid = ut.userid where u.userid = @userid )v left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid left join (select storyid,count(*) as count  from storylike group by storyid)c on v.a=c.storyid left join (select storyid,count(*) as cmt  from comments group by storyid)co on v.a=co.storyid  left join (select storyid,count(*) as vw  from storyview group by storyid)vi on v.a=vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid order by v.a desc";

                cmd.Parameters.AddWithValue("@userid", userID);
               
                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        StoryDataDTO temp = new StoryDataDTO
                        {
                            
                            userid = userID,
                            storyid = reader.GetFieldValue<int>(0),
                            storytitle = reader.GetFieldValue<string>(1),
                            storydesc = Convert.IsDBNull(reader["storydesc"]) ? "" : (string?)reader["storydesc"],
                            spages = (int)reader.GetFieldValue<long>(3),
                            storylike = (int)reader.GetFieldValue<long>(4),
                            storycomment = (int)reader.GetFieldValue<long>(5),
                            storyview = (int)reader.GetFieldValue<long>(6),
                            storyimg = Convert.IsDBNull(reader["storyimg"]) ? null : (string?)reader["storyimg"],
                            followingid = reader.GetFieldValue<string>(8),
                            followingname = reader.GetFieldValue<string>(9),
                            createdate = Convert.IsDBNull(reader["createdate"]) ? default : (DateTime)reader["createdate"],
                            storytype = reader.GetFieldValue<int>(11).ToString(),
                            storystatus = reader.GetFieldValue<int>(12),
                            islike = reader.GetFieldValue<int>(13) == 0 ? false : true,
                        };
                        storyDataDTO.Add(temp);
                    }
            }

            return storyDataDTO;
        }

        public List<StoryDataDTO> GetTopStory(string userID)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                // admin approded 2 cmd.CommandText= @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (c.count is NULL,0,c.count) as storylike,if (co.cmt is NULL,0,co.cmt) as storycomment,if (vi.vw is NULL,0,vi.vw) as storyview,v.i as storyimg, v.uu as userid, v.n as name, DATE_FORMAT(v.cd, '%Y-%m-%d %H:%i:%s') as createdate,if (il.islike is null,0,il.islike) as islike,v.uu as userid from(SELECT u.storyid as a, u.storytitle as t, u.storydesc as d, u.storyimg as i, ut.userid as uu, ut.name as n,u.createdate as cd FROM userstory u inner join usertbl ut on u.userid = ut.userid where u.userid != @userid  and u.storystatus = 2)v left join(select storyid, count(*) as count  from storylike group by storyid)c on v.a = c.storyid left join(select storyid, count(*) as cmt  from comments group by storyid)co on v.a = co.storyid left join(select storyid, count(*) as vw  from storyview group by storyid)vi on v.a = vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid order by v.a desc";
                //cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spages,if (c.count is NULL,0,c.count) as storylike,if (co.cmt is NULL,0,co.cmt) as storycomment,if (vi.vw is NULL,0,vi.vw) as storyview,v.i as storyimg, v.uu as userid, v.n as name, DATE_FORMAT(v.cd, '%Y-%m-%d %H:%i:%s') as createdate,if (il.islike is null,0,il.islike) as islike,v.uu as userid ,sty.sttype as storytype from(SELECT u.storyid as a, u.storytitle as t, u.storydesc as d, u.storyimg as i, ut.userid as uu, ut.name as n,u.createdate as cd, u.storytype  FROM userstory u inner join usertbl ut on u.userid = ut.userid where u.storystatus = 1)v left join (select stid,sttype from storytypes)sty on sty.stid=v.storytype  left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid left join(select storyid, count(*) as count  from storylike group by storyid)c on v.a = c.storyid left join(select storyid, count(*) as cmt  from comments group by storyid)co on v.a = co.storyid left join(select storyid, count(*) as vw  from storyview group by storyid)vi on v.a = vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid order by storyview desc, storylike desc,createdate desc  limit 20";
                cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spages,if (c.count is NULL,0,c.count) as storylike,if (co.cmt is NULL,0,co.cmt) as storycomment,if (vi.vw is NULL,0,vi.vw) as storyview,v.i as storyimg, v.uu as userid, v.n as name, DATE_FORMAT(v.cd, '%Y-%m-%d %H:%i:%s') as createdate,if (il.islike is null,0,il.islike) as islike,v.uu as userid ,sty.sttype as storytype from(SELECT u.storyid as a, u.storytitle as t, u.storydesc as d, u.storyimg as i, ut.userid as uu, ut.name as n,u.createdate as cd, u.storytype  FROM userstory u inner join usertbl ut on u.userid = ut.userid and u.userid not in(select reportblockuser from reportblockuser ru where  ru.userid = @userid  and ru.reportblockflag=2) and u.storyid not in(select reportblockstoryid from reportblockcontent ru where  ru.userid = @userid and ru.reportblockCflag = 2) where u.storystatus = 1)v left join (select stid,sttype from storytypes)sty on sty.stid=v.storytype  left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid left join(select storyid, count(*) as count  from storylike group by storyid)c on v.a = c.storyid left join(select storyid, count(*) as cmt  from comments group by storyid)co on v.a = co.storyid left join(select storyid, count(*) as vw  from storyview group by storyid)vi on v.a = vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid order by storyview desc, storylike desc,createdate desc  limit 20";

                cmd.Parameters.AddWithValue("@userid", userID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        StoryDataDTO temp = new StoryDataDTO
                        {
                            userid = userID,
                            storyid = reader.GetFieldValue<int>(0),
                            storytitle = reader.GetFieldValue<string>(1),
                            storydesc = Convert.IsDBNull(reader["storydesc"]) ? "" : (string?)reader["storydesc"],
                            spages = (int)reader.GetFieldValue<long>(3),
                            storylike = (int)reader.GetFieldValue<long>(4),
                            storycomment = (int)reader.GetFieldValue<long>(5),
                            storyview = (int)reader.GetFieldValue<long>(6),
                            storyimg = Convert.IsDBNull(reader["storyimg"]) ? null : (string?)reader["storyimg"],
                            followingid = reader.GetFieldValue<string>(8),
                            followingname = reader.GetFieldValue<string>(9),
                            createdate = Convert.ToDateTime(reader.GetFieldValue<String>(10)),
                            islike = reader.GetFieldValue<int>(11) == 0 ? false : true,
                            storytype = Convert.IsDBNull(reader["storytype"]) ? null : (string?)reader["storytype"],

                        };
                        storyDataDTO.Add(temp);
                    }
            }

            return storyDataDTO;
        }

        public List<StoryDataDTO> Storyfan(string userID)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                //cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (c.count is NULL,0,c.count) as storylike ,if (co.cmt is NULL,0,co.cmt) as storycomment,if (vi.vw is NULL,0,vi.vw) as storyview ,v.i as storyimg, v.uu as userid, v.n as name, v.cd as createdate,if (il.islike is null,0,il.islike) as islike from(SELECT Max(u.storyid) as a, u.storytitle as t, u.storydesc as d, u.storyimg as i, ut.userid as uu, ut.name as n, u.createdate as cd FROM userstory u inner join usertbl ut on u.userid = ut.userid  where u.userid in (SELECT distinct f.followingid as f FROM userstory u inner join following f on u.userid = f.followingid  where f.userid = @userid)  and ut.userid != @userid and u.storystatus = 1 group by u.storyid,u.userid order by u.storyid desc )v left join(select storyid, count(*) as count  from storylike group by storyid)c on v.a = c.storyid  left join(select storyid, count(*) as cmt  from comments group by storyid)co on v.a = co.storyid  left join(select storyid, count(*) as vw  from storyview group by storyid)vi on v.a = vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid  group by v.n limit 10";
                //cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spage,if (c.count is NULL,0,c.count) as storylike ,if (co.cmt is NULL,0,co.cmt) as storycomment,if (vi.vw is NULL,0,vi.vw) as storyview ,v.i as storyimg, v.uu as userid, v.n as name, v.cd as createdate,if (il.islike is null,0,il.islike) as islike,sty.sttype as storytype from(SELECT Max(u.storyid) as a, u.storytitle as t, u.storydesc as d, u.storyimg as i, ut.userid as uu, ut.name as n, u.createdate as cd,u.storytype FROM userstory u inner join usertbl ut on u.userid = ut.userid  where u.userid in (SELECT distinct f.followingid as f FROM userstory u inner join following f on u.userid = f.followingid  where f.userid = @userid)  and ut.userid != @userid and u.storystatus = 1 group by u.storyid,u.userid order by u.storyid desc )v left join (select stid,sttype from storytypes)sty on sty.stid=v.storytype  left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid left join(select storyid, count(*) as count  from storylike group by storyid)c on v.a = c.storyid  left join(select storyid, count(*) as cmt  from comments group by storyid)co on v.a = co.storyid  left join(select storyid, count(*) as vw  from storyview group by storyid)vi on v.a = vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid  group by v.n limit 10";
                cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spage,if (c.count is NULL,0,c.count) as storylike ,if (co.cmt is NULL,0,co.cmt) as storycomment,if (vi.vw is NULL,0,vi.vw) as storyview ,v.i as storyimg, v.uu as userid, v.n as name, v.cd as createdate,if (il.islike is null,0,il.islike) as islike,sty.sttype as storytype from(SELECT Max(u.storyid) as a, u.storytitle as t, u.storydesc as d, u.storyimg as i, ut.userid as uu, ut.name as n, u.createdate as cd,u.storytype FROM userstory u inner join usertbl ut on u.userid = ut.userid  where u.userid in (SELECT distinct f.followingid as f FROM userstory u inner join following f on u.userid = f.followingid  where f.userid = @userid)  and ut.userid != @userid and u.userid not in(select reportblockuser from reportblockuser ru where  ru.userid = @userid  and ru.reportblockflag=2) and u.storyid not in(select reportblockstoryid from reportblockcontent ru where  ru.userid = @userid and ru.reportblockCflag = 2) and u.storystatus = 1 group by u.storyid,u.userid order by u.storyid desc )v left join (select stid,sttype from storytypes)sty on sty.stid=v.storytype  left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid left join(select storyid, count(*) as count  from storylike group by storyid)c on v.a = c.storyid  left join(select storyid, count(*) as cmt  from comments group by storyid)co on v.a = co.storyid  left join(select storyid, count(*) as vw  from storyview group by storyid)vi on v.a = vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid  group by v.n limit 10";

                cmd.Parameters.AddWithValue("@userid", userID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        StoryDataDTO temp = new StoryDataDTO
                        {
                            userid = userID,
                            storyid = reader.GetFieldValue<int>(0),
                            storytitle = reader.GetFieldValue<string>(1),
                            storydesc = Convert.IsDBNull(reader["storydesc"]) ? "" : (string?)reader["storydesc"],
                            spages = (int)reader.GetFieldValue<long>(3),
                            storylike = (int)reader.GetFieldValue<long>(4),
                            storycomment = (int)reader.GetFieldValue<long>(5),
                            storyview = (int)reader.GetFieldValue<long>(6),
                            storyimg = Convert.IsDBNull(reader["storyimg"]) ? null : (string?)reader["storyimg"],
                            followingid = reader.GetFieldValue<string>(8),
                            followingname = reader.GetFieldValue<string>(9),
                            createdate = Convert.IsDBNull(reader["createdate"]) ? default : (DateTime)reader["createdate"],
                            islike = reader.GetFieldValue<int>(11) == 0 ? false : true,
                            storytype = Convert.IsDBNull(reader["storytype"]) ? null : (string?)reader["storytype"],

                        };
                        storyDataDTO.Add(temp);
                    }
            }

            return storyDataDTO;
        }

        public List<StoryDataDTO> Storybecomefan(string userID)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
               // cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if(c.count is NULL,0,c.count) as storylike ,if(co.cmt is NULL,0,co.cmt) as storycomment,if(vi.vw is NULL,0,vi.vw) as storyview ,v.i as storyimg, v.uu as userid, v.n as name, v.cd as createdate, if (il.islike is null,0,il.islike) as islike from  (SELECT Max(u.storyid) as a,u.storytitle as t,u.storydesc as d,u.storyimg as i, ut.userid as uu,ut.name as n,u.createdate as cd FROM userstory u inner join usertbl ut on u.userid = ut.userid  where u.userid in(SELECT distinct f.userid as f FROM userstory u inner join following f on u.userid = f.followingid  where f.followingid = @userid)   and u.storystatus=1 group by u.storyid,u.userid order by u.storyid desc  )v  left join (select storyid,count(*) as count  from storylike group by storyid)c on v.a=c.storyid  left join (select storyid,count(*) as cmt  from comments group by storyid)co on v.a=co.storyid  left join (select storyid,count(*) as vw  from storyview group by storyid)vi on v.a=vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid group by v.n  limit 10";
               // cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spage,if(c.count is NULL,0,c.count) as storylike ,if(co.cmt is NULL,0,co.cmt) as storycomment,if(vi.vw is NULL,0,vi.vw) as storyview ,v.i as storyimg, v.uu as userid, v.n as name, v.cd as createdate, if (il.islike is null,0,il.islike) as islike,sty.sttype as storytype from  (SELECT Max(u.storyid) as a,u.storytitle as t,u.storydesc as d,u.storyimg as i, ut.userid as uu,ut.name as n,u.createdate as cd, u.storytype FROM userstory u inner join usertbl ut on u.userid = ut.userid  where u.userid in(SELECT distinct f.userid as f FROM userstory u inner join following f on u.userid = f.followingid  where f.followingid = @userid)   and u.storystatus=1 group by u.storyid,u.userid order by u.storyid desc  )v left join (select stid,sttype from storytypes)sty on sty.stid=v.storytype  left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid  left join (select storyid,count(*) as count  from storylike group by storyid)c on v.a=c.storyid  left join (select storyid,count(*) as cmt  from comments group by storyid)co on v.a=co.storyid  left join (select storyid,count(*) as vw  from storyview group by storyid)vi on v.a=vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid group by v.n  limit 10";
                cmd.CommandText = @"select v.a as storyid,v.t as storytitle,v.d as storydesc,if (sp.spages is NULL,0,sp.spages) as spage,if(c.count is NULL,0,c.count) as storylike ,if(co.cmt is NULL,0,co.cmt) as storycomment,if(vi.vw is NULL,0,vi.vw) as storyview ,v.i as storyimg, v.uu as userid, v.n as name, v.cd as createdate, if (il.islike is null,0,il.islike) as islike,sty.sttype as storytype from  (SELECT Max(u.storyid) as a,u.storytitle as t,u.storydesc as d,u.storyimg as i, ut.userid as uu,ut.name as n,u.createdate as cd, u.storytype FROM userstory u inner join usertbl ut on u.userid = ut.userid  where u.userid in(SELECT distinct f.userid as f FROM userstory u inner join following f on u.userid = f.followingid  where f.followingid = @userid)  and u.userid not in(select reportblockuser from reportblockuser ru where  ru.userid = @userid  and ru.reportblockflag=2) and u.storyid not in(select reportblockstoryid from reportblockcontent ru where  ru.userid = @userid and ru.reportblockCflag = 2) and u.storystatus=1 group by u.storyid,u.userid order by u.storyid desc  )v left join (select stid,sttype from storytypes)sty on sty.stid=v.storytype  left join(select storyid, count(*) as spages  from storypages group by storyid)sp on v.a = sp.storyid  left join (select storyid,count(*) as count  from storylike group by storyid)c on v.a=c.storyid  left join (select storyid,count(*) as cmt  from comments group by storyid)co on v.a=co.storyid  left join (select storyid,count(*) as vw  from storyview group by storyid)vi on v.a=vi.storyid left join(select if (count(likebyid) > 0,1,0) as islike,storyid from storylike where likebyid = @userid group by likebyid,storyid)il on  v.a = il.storyid group by v.n  limit 10";

                cmd.Parameters.AddWithValue("@userid", userID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        StoryDataDTO temp = new StoryDataDTO
                        {
                            userid = userID,
                            storyid = reader.GetFieldValue<int>(0),
                            storytitle = reader.GetFieldValue<string>(1),
                            storydesc = Convert.IsDBNull(reader["storydesc"]) ? "" : (string?)reader["storydesc"],
                            spages = (int)reader.GetFieldValue<long>(3),
                            storylike = (int)reader.GetFieldValue<long>(4),
                            storycomment = (int)reader.GetFieldValue<long>(5),
                            storyview = (int)reader.GetFieldValue<long>(6),
                            storyimg = Convert.IsDBNull(reader["storyimg"]) ? null : (string?)reader["storyimg"],
                            followingid = reader.GetFieldValue<string>(8),
                            followingname = reader.GetFieldValue<string>(9),
                            createdate = Convert.IsDBNull(reader["createdate"]) ? default : (DateTime)reader["createdate"],
                            islike = reader.GetFieldValue<int>(11) == 0 ? false : true,
                            storytype = Convert.IsDBNull(reader["storytype"]) ? null : (string?)reader["storytype"],

                        };
                        storyDataDTO.Add(temp);
                    }
            }

            return storyDataDTO;
        }

        public string SaveStory(StoryDataDTO storyDataDTO)
        {
            int result = 0;
            string sid="";
            string dt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                /*var cmd = db.Connection.CreateCommand() as MySqlCommand;
                //cmd.CommandText = @"SELECT u.storyid,u.storytitle,u.storydesc,u.storylike,u.storyimg,f.followingid ,ut.name,u.createdate FROM userstory u inner join following f on u.userid = f.userid inner join usertbl ut on f.followingid = ut.userid  where u.userid = @userid";
                //cmd.CommandText = @"SELECT u.storyid,u.storytitle,u.storydesc,u.storylike,u.storyimg, ut.userid,ut.name,u.createdate FROM userstory u inner join usertbl ut on u.userid = ut.userid  where u.userid in(SELECT distinct f.followingid as f FROM userstory u inner join following f on u.userid = f.followingid  where f.userid = @userid)  and ut.userid != @userid";
                // cmd.CommandText = @"select storyid from userstory where userid = @userid and  createdate = @createdate";
                cmd.CommandText = @"select storyid from userstory where userid =@userid and  storytitle = @storytitle and storydesc = @storydesc ";

                cmd.Parameters.AddWithValue("@userid", storyDataDTO.userid);
                cmd.Parameters.AddWithValue("@storytitle", storyDataDTO.storytitle);
                cmd.Parameters.AddWithValue("@storydesc", storyDataDTO.storydesc);


                using (var reader = cmd.ExecuteReader())
                    if (reader.HasRows)
                    {
                        sid = "Story Already created";
                    }
                else
                    {
                        reader.Close();*/
                        var cmd = db.Connection.CreateCommand() as MySqlCommand;
                        if (storyDataDTO.storyimg != null)
                            cmd.CommandText = @"insert into userstory (userid, storytitle,storydesc,storylike,storyimg,storystatus,storypages,storytype,createdate) values (@userid, @storytitle, @storydesc, @storylike, @storyimg, @storystatus, @storypages,@storytype,@createdate)";
                        else
                        {
                            cmd.CommandText = @"insert into userstory (userid, storytitle,storydesc,storylike,storystatus,storypages,storytype,createdate) values (@userid, @storytitle, @storydesc, @storylike, @storystatus, @storypages,@storytype,@createdate)";

                        }
                        cmd.Parameters.AddWithValue("@userid", storyDataDTO.userid);
                        cmd.Parameters.AddWithValue("@storytitle", storyDataDTO.storytitle);
                        cmd.Parameters.AddWithValue("@storydesc", storyDataDTO.storydesc);
                        cmd.Parameters.AddWithValue("@storylike", storyDataDTO.storylike);
                        //cmd.Parameters.AddWithValue("@createdate", dt);
                        if (storyDataDTO.storyimg != null)
                        {
                            cmd.Parameters.AddWithValue("@storyimg", storyDataDTO.storyimg);
                        }

                        cmd.Parameters.AddWithValue("@storystatus", storyDataDTO.storystatus);
                        cmd.Parameters.AddWithValue("@storypages", storyDataDTO.storypages);
                        if(storyDataDTO.storytype == "null")
                            cmd.Parameters.AddWithValue("@storytype", null);
                        else
                            cmd.Parameters.AddWithValue("@storytype", storyDataDTO.storytype);
                        cmd.Parameters.AddWithValue("@createdate", dt);
                        result = cmd.ExecuteNonQuery();
                  //  }

               
            }
            if(result == 1)
            {
                sid = "Story created successfully";
                using (MySqlDatabase db = new MySqlDatabase(connString))
                {
                    var cmd = db.Connection.CreateCommand() as MySqlCommand;
                    //cmd.CommandText = @"SELECT u.storyid,u.storytitle,u.storydesc,u.storylike,u.storyimg,f.followingid ,ut.name,u.createdate FROM userstory u inner join following f on u.userid = f.userid inner join usertbl ut on f.followingid = ut.userid  where u.userid = @userid";
                    //cmd.CommandText = @"SELECT u.storyid,u.storytitle,u.storydesc,u.storylike,u.storyimg, ut.userid,ut.name,u.createdate FROM userstory u inner join usertbl ut on u.userid = ut.userid  where u.userid in(SELECT distinct f.followingid as f FROM userstory u inner join following f on u.userid = f.followingid  where f.userid = @userid)  and ut.userid != @userid";
                   // cmd.CommandText = @"select storyid from userstory where userid = @userid and  createdate = @createdate";
                    cmd.CommandText = @"select storyid from userstory where userid = '" + storyDataDTO.userid + "' and  createdate = '"+ dt + "'";

                   // cmd.Parameters.AddWithValue("@userid", storyDataDTO.userid);
                    //cmd.Parameters.AddWithValue("@createdate", dt);

                    using (var reader = cmd.ExecuteReader())
                        while (reader.Read())
                        {
                            sid = reader.GetFieldValue<int>(0).ToString();
                        }

                        try
                        {
                            cmd = db.Connection.CreateCommand() as MySqlCommand;
                            //cmd.CommandText = @"SELECT u.storyid,u.storytitle,u.storydesc,u.storylike,u.storyimg,f.followingid ,ut.name,u.createdate FROM userstory u inner join following f on u.userid = f.userid inner join usertbl ut on f.followingid = ut.userid  where u.userid = @userid";
                            //cmd.CommandText = @"SELECT u.storyid,u.storytitle,u.storydesc,u.storylike,u.storyimg, ut.userid,ut.name,u.createdate FROM userstory u inner join usertbl ut on u.userid = ut.userid  where u.userid in(SELECT distinct f.followingid as f FROM userstory u inner join following f on u.userid = f.followingid  where f.userid = @userid)  and ut.userid != @userid";
                            cmd.CommandText = @"select distinct f.followingid as userid,us.userid  as notificationto  from userstory us inner join following f on us.userid=f.userid  where f.followingid=@userid";
                            cmd.Parameters.AddWithValue("@userid", storyDataDTO.userid);
                            DataTable dt1;
                        using (MySqlDataAdapter sda = new MySqlDataAdapter(cmd))
                        {
                            using (dt1 = new DataTable())
                            {
                                sda.Fill(dt1);
                               
                            }
                        }
                        for (int i= 0;i< dt1.Rows.Count;i++)
                        {
                            cmd = db.Connection.CreateCommand() as MySqlCommand;
                            cmd.CommandText = @"insert into notification (userid, notificationto,notification,storyid,notificationdate) values (@userid,@notificationto,@notification,@storyid,@createdate)";
                            cmd.Parameters.AddWithValue("@userid", storyDataDTO.userid);
                            cmd.Parameters.AddWithValue("@notificationto", dt1.Rows[i][1]);
                            cmd.Parameters.AddWithValue("@notification", 5);
                            cmd.Parameters.AddWithValue("@storyid", sid);
                            cmd.Parameters.AddWithValue("@createdate", dt);

                            int result1 = cmd.ExecuteNonQuery();
                        }

                        cmd = db.Connection.CreateCommand() as MySqlCommand;
                        cmd.CommandText = @"insert into notification (userid, notificationto,notification,storyid,notificationdate) values (@userid,@notificationto,@notification,@storyid,@createdate)";
                        cmd.Parameters.AddWithValue("@userid", storyDataDTO.userid);
                        cmd.Parameters.AddWithValue("@notificationto", storyDataDTO.userid);
                        cmd.Parameters.AddWithValue("@notification", 5);
                        cmd.Parameters.AddWithValue("@storyid", sid);
                        cmd.Parameters.AddWithValue("@createdate", dt);

                        int result2 = cmd.ExecuteNonQuery();
                    }
                        catch (Exception e)
                        {
                            Console.WriteLine(e.Message.ToString());
                        }



                }

            }
            
            return sid;
        }

        public string UpdateStory(StoryDataDTO storyDataDTO)
        {
            int result = 0;
            string sid="";
            string dt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                try
                {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                if (storyDataDTO.storyimg != null)
                    cmd.CommandText = @"update userstory set storytitle = @storytitle, storydesc = @storydesc, storyimg = @storyimg,storystatus = @storystatus,storytype = @storytype where userid=@userid and storyid=@storyid";
                else
                {
                    cmd.CommandText = @"update userstory set storytitle = @storytitle, storydesc = @storydesc, storystatus = @storystatus,storytype = @storytype where userid=@userid and storyid=@storyid";

                }
                   
                cmd.Parameters.AddWithValue("@storyid", storyDataDTO.storyid);
                cmd.Parameters.AddWithValue("@userid", storyDataDTO.userid);
                cmd.Parameters.AddWithValue("@storytitle", storyDataDTO.storytitle);
                cmd.Parameters.AddWithValue("@storydesc", storyDataDTO.storydesc);
                //cmd.Parameters.AddWithValue("@storylike", storyDataDTO.storylike);
                //cmd.Parameters.AddWithValue("@createdate", dt);
                if (storyDataDTO.storyimg != null)
                {
                    cmd.Parameters.AddWithValue("@storyimg", storyDataDTO.storyimg);
                }
                
                cmd.Parameters.AddWithValue("@storystatus", storyDataDTO.storystatus);
               // cmd.Parameters.AddWithValue("@storypages", storyDataDTO.storypages);
                cmd.Parameters.AddWithValue("@storytype", storyDataDTO.storytype);
                //cmd.Parameters.AddWithValue("@createdate", dt);
                result = cmd.ExecuteNonQuery();
                }
                catch(Exception e)
                {
                    sid = e.Message;
                }
              
            }
            if(result == 1)
            {
                sid = "successfully updated";
                using (MySqlDatabase db = new MySqlDatabase(connString))
                {
                    var cmd = db.Connection.CreateCommand() as MySqlCommand;
                    //cmd.CommandText = @"SELECT u.storyid,u.storytitle,u.storydesc,u.storylike,u.storyimg,f.followingid ,ut.name,u.createdate FROM userstory u inner join following f on u.userid = f.userid inner join usertbl ut on f.followingid = ut.userid  where u.userid = @userid";
                    //cmd.CommandText = @"SELECT u.storyid,u.storytitle,u.storydesc,u.storylike,u.storyimg, ut.userid,ut.name,u.createdate FROM userstory u inner join usertbl ut on u.userid = ut.userid  where u.userid in(SELECT distinct f.followingid as f FROM userstory u inner join following f on u.userid = f.followingid  where f.userid = @userid)  and ut.userid != @userid";
                   // cmd.CommandText = @"select storyid from userstory where userid = @userid and  createdate = @createdate";
                    cmd.CommandText = @"select storyid from userstory where userid = '" + storyDataDTO.userid + "' and  createdate = '"+ dt + "'";

                   // cmd.Parameters.AddWithValue("@userid", storyDataDTO.userid);
                    //cmd.Parameters.AddWithValue("@createdate", dt);

                    using (var reader = cmd.ExecuteReader())
                        while (reader.Read())
                        {
                            sid = reader.GetFieldValue<int>(0).ToString();
                        }

                        try
                        {
                           
                            cmd = db.Connection.CreateCommand() as MySqlCommand;
                            cmd.CommandText = @"insert into notification (userid, notificationto,notification,storyid,notificationdate) values (@userid,@notificationto,@notification,@storyid,@createdate)";
                           // cmd.Parameters.AddWithValue("@userid", storyDataDTO.userid);
                            cmd.Parameters.AddWithValue("@notificationto", storyDataDTO.userid);
                            cmd.Parameters.AddWithValue("@notification", 8);
                            //cmd.Parameters.AddWithValue("@storyid", sid);
                            cmd.Parameters.AddWithValue("@createdate", dt);

                        int result1 = cmd.ExecuteNonQuery();
                        }
                        catch (Exception e)
                        {
                            Console.WriteLine(e.Message.ToString());
                        }



                }

            }

            return sid;
        }

        public int AddStoryLike(StoryLikeDataDTO storyLikeDataDTO)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {

                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT * FROM storylike WHERE storyid = @storyid  AND likebyid = @likebyid";
                cmd.Parameters.AddWithValue("@storyid", storyLikeDataDTO.storyid);
                cmd.Parameters.AddWithValue("@likebyid", storyLikeDataDTO.likebyid);
                var reader = cmd.ExecuteReader();
                if (reader.HasRows==false)
           
                {
                    reader.Close();

                    cmd.CommandText = @"insert into storylike (storyid, likebyid) values (@storyid, @likebyid)";
                //cmd.Parameters.AddWithValue("@storyid", storyLikeDataDTO.storyid);
                //cmd.Parameters.AddWithValue("@likebyid", storyLikeDataDTO.likebyid);

                result = cmd.ExecuteNonQuery();
                if (result == 1)
                {
                    try
                    {
                            reader.Close();
                        cmd = db.Connection.CreateCommand() as MySqlCommand;
                        //cmd.CommandText = @"SELECT u.storyid,u.storytitle,u.storydesc,u.storylike,u.storyimg,f.followingid ,ut.name,u.createdate FROM userstory u inner join following f on u.userid = f.userid inner join usertbl ut on f.followingid = ut.userid  where u.userid = @userid";
                        //cmd.CommandText = @"SELECT u.storyid,u.storytitle,u.storydesc,u.storylike,u.storyimg, ut.userid,ut.name,u.createdate FROM userstory u inner join usertbl ut on u.userid = ut.userid  where u.userid in(SELECT distinct f.followingid as f FROM userstory u inner join following f on u.userid = f.followingid  where f.userid = @userid)  and ut.userid != @userid";
                        cmd.CommandText = @"select userid  from userstory where storyid = @storyid";
                      cmd.Parameters.AddWithValue("@storyid", storyLikeDataDTO.storyid);
                        string uid = "";
                            var reader1 = cmd.ExecuteReader();
                           // using (var reader1 = cmd.ExecuteReader())
                            while (reader1.Read())
                            {
                                uid = reader1.GetFieldValue<string>(0).ToString();
                            }
                            reader1.Close();
                            cmd = db.Connection.CreateCommand() as MySqlCommand;
                        cmd.CommandText = @"insert into notification (userid, notificationto,notification,storyid,notificationdate) values (@userid,@notificationto,@notification,@storyid,now())";
                        cmd.Parameters.AddWithValue("@userid", storyLikeDataDTO.likebyid);
                        cmd.Parameters.AddWithValue("@notificationto", uid);                       
                        cmd.Parameters.AddWithValue("@notification", 4);
                        cmd.Parameters.AddWithValue("@storyid", storyLikeDataDTO.storyid);

                        int result1 = cmd.ExecuteNonQuery();
                    }
                    catch (Exception e) {
                        Console.WriteLine(e.Message.ToString());
                    }

                }

            }

                else
                {
                    //already exist
                    reader.Close();
                    cmd.CommandText = @"delete FROM storylike WHERE storyid = @storyid  AND likebyid = @likebyid";
                    cmd.ExecuteNonQuery();
                    result = 0;
                }

            }
            return result;
        }
        public int AddserReportBlock(UserReportBlockDataDTO userReportBlockDataDTO)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {

                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT * FROM reportblockuser WHERE userid = @userid  AND reportblockUser = @reportblockUser";
                cmd.Parameters.AddWithValue("@userid", userReportBlockDataDTO.userid);
                cmd.Parameters.AddWithValue("@reportblockUser", userReportBlockDataDTO.reportblockUser);
                //cmd.Parameters.AddWithValue("@storyid", userReportBlockDataDTO.storyid);

                var reader = cmd.ExecuteReader();
                if (reader.HasRows == false)

                {
                    reader.Close();
                    cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"insert into reportblockuser (userid, reportblockUser, reportblockflag) values (@userid, @reportblockUser, @reportblockflag)";
                    cmd.Parameters.AddWithValue("@userid", userReportBlockDataDTO.userid);
                    cmd.Parameters.AddWithValue("@reportblockUser", userReportBlockDataDTO.reportblockUser);
                    cmd.Parameters.AddWithValue("@reportblockflag", Int32.Parse(userReportBlockDataDTO.reportblockflag));

                    result = cmd.ExecuteNonQuery();
                   
                }

                else
                {
                    //already exist
                    reader.Close();
                    cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"update reportblockuser set reportblockflag=@reportblockflag WHERE userid = @userid  AND reportblockUser = @reportblockUser";
                    cmd.Parameters.AddWithValue("@userid", userReportBlockDataDTO.userid);
                    cmd.Parameters.AddWithValue("@reportblockUser", userReportBlockDataDTO.reportblockUser);
                    cmd.Parameters.AddWithValue("@reportblockflag", Int32.Parse(userReportBlockDataDTO.reportblockflag));

                    result = cmd.ExecuteNonQuery();
                }

            }
            return result;
        }
        public int AddStoryReportBlock(StoryReportBlockDataDTO storyReportBlockDataDTO)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {

                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT * FROM reportblockcontent WHERE userid = @userid  AND reportblockstoryid = @reportblockstoryid ";
                cmd.Parameters.AddWithValue("@userid", storyReportBlockDataDTO.userid);
                cmd.Parameters.AddWithValue("@reportblockstoryid", storyReportBlockDataDTO.reportblockstoryid);
                var reader = cmd.ExecuteReader();
                if (reader.HasRows == false)
                {
                    reader.Close();
                    cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"insert into reportblockcontent (userid, reportblockstoryid,reportblockCflag) values (@userid, @reportblockstoryid,@reportblockCflag)";
                    cmd.Parameters.AddWithValue("@userid", storyReportBlockDataDTO.userid);
                    cmd.Parameters.AddWithValue("@reportblockstoryid", storyReportBlockDataDTO.reportblockstoryid);
                    cmd.Parameters.AddWithValue("@reportblockCflag", Int32.Parse(storyReportBlockDataDTO.reportblockCflag));

                    result = cmd.ExecuteNonQuery();                    
                }
                else
                {
                    //already exist
                    reader.Close();
                    cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"update reportblockcontent set reportblockCflag=@reportblockCflag where userid=@userid and reportblockstoryid=@reportblockstoryid";
                    cmd.Parameters.AddWithValue("@userid", storyReportBlockDataDTO.userid);
                    cmd.Parameters.AddWithValue("@reportblockstoryid", storyReportBlockDataDTO.reportblockstoryid);
                    cmd.Parameters.AddWithValue("@reportblockCflag", Int32.Parse( storyReportBlockDataDTO.reportblockCflag));

                    result = cmd.ExecuteNonQuery();
                }

            }
            return result;
        }
        public int AddStoryView(StoryViewDataDTO storyViewDataDTO)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"insert into storyview (storyid, storyviewbyid) values (@storyid, @storyviewbyid)";
                cmd.Parameters.AddWithValue("@storyid", storyViewDataDTO.storyid);
                cmd.Parameters.AddWithValue("@storyviewbyid", storyViewDataDTO.storyviewbyid);

                result = cmd.ExecuteNonQuery();
            }
            return result;
        }
        public int deletestorycoverfile(string storypagefile, string userid)
        {
            try
            {
                var dpath = Path.Combine(Path.Combine(Directory.GetCurrentDirectory(), "userimages\\") + userid + "\\" + storypagefile.Substring(storypagefile.LastIndexOf("\\")));
                dpath = dpath.Replace("api.vtelltales.com", "data.vtelltales.com");
                FileInfo file = new FileInfo(dpath);
                if (file.Exists)//check file exsit or not.
                {
                    file.Delete();
                }
            }
            catch (Exception e)
            {
                _ = e.Message;
            }
           
            return 0;
        }
        public int deletestorypagefile(string storypagefile, string userid)
        {
            try
            {
                var dpath = Path.Combine(Path.Combine(Directory.GetCurrentDirectory(), "storydata\\") + userid + "\\" + storypagefile.Substring(storypagefile.LastIndexOf("/")));
                dpath = dpath.Replace("api.vtelltales.com", "data.vtelltales.com");
                FileInfo file = new FileInfo(dpath);
                if (file.Exists)//check file exsit or not.
                {
                    file.Delete();
                }
            }
            catch (Exception e)
            {
                _ = e.Message;
            }
           
            return 0;
        }
        public int deletemystory(int storyid, string userid)
        {
            
            int result = 0;
            int ptype = 0;
            string storypage = string.Empty;
            string? storyimg = null;
            
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT storyimg from userstory WHERE storyid=@storyid";
                cmd.Parameters.AddWithValue("@storyid", storyid);
                var reader = cmd.ExecuteReader();
                while(reader.Read())
                {
                    try
                    {
                        storyimg = Convert.IsDBNull(reader["storyimg"]) ? null : (string?)reader["storyimg"];
                        if (storyimg != null)
                        {                            
                            deletestorycoverfile(storyimg, userid);
                        }
                    }
                    catch (Exception e)
                    {
                        string err = e.Message.ToString();
                    }                   
                }
                reader.Close();
                cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"delete from userstory where storyid=@storyid";
                cmd.Parameters.AddWithValue("@storyid", storyid);
                result = cmd.ExecuteNonQuery();
                if(result == 1)
                {
                    cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"SELECT pageno,pagestory,storypagetype,pagestory from storypages WHERE storyid=@storyid";
                    cmd.Parameters.AddWithValue("@storyid", storyid);
                    reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        try
                        {
                            ptype = Convert.IsDBNull(reader["storypagetype"]) ? -1 : (int)reader["storypagetype"];
                            if (ptype != 0)
                            {
                                storypage = Convert.IsDBNull(reader["pagestory"]) ? string.Empty : (string?)reader["pagestory"] ?? string.Empty;
                                if (!string.IsNullOrEmpty(storypage))
                                {
                                    deletestorypagefile(storypage, userid);
                                }
                            }

                        }
                        catch (Exception e)
                        {
                            _ = e.Message;
                        }
                    }
                    reader.Close();
                    int result1 = 0;
                    cmd = db.Connection.CreateCommand() as MySqlCommand;
                    cmd.CommandText = @"delete from storypages where storyid=@storyid";
                    cmd.Parameters.AddWithValue("@storyid", storyid);
                    //cmd.Parameters.AddWithValue("@storyviewbyid", storyViewDataDTO.storyviewbyid);
                    result1 = cmd.ExecuteNonQuery();
                }
            }
            return result;
        }

        public int AddStoryComment(StoryCommentDTO storyCommentDTO)
        {
            int result = 0;
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {

                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"insert into comments (storyid, userid,comment, comdate) values (@storyid,@userid, @comment, Now())";
                cmd.Parameters.AddWithValue("@storyid", storyCommentDTO.storyid);
                cmd.Parameters.AddWithValue("@userid", storyCommentDTO.userid);
                cmd.Parameters.AddWithValue("@comment", storyCommentDTO.storycomment);

                result = cmd.ExecuteNonQuery();
            }
            return result;
        }
        public List<StoryCommentDTO> GetStoryComments(int storyID)
        {
            List<StoryCommentDTO> storyCommentDTO = new List<StoryCommentDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"select c.userid,comment, DATE_FORMAT(comdate, '%Y-%m-%d %H:%i:%s') as comdate,name,u.profileimg from comments c inner join usertbl u on u.userid=c.userid where c.storyid=@storyid ";
                cmd.Parameters.AddWithValue("@storyid", storyID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        var userid = reader.IsDBNull(0) ? string.Empty : reader.GetString(0);
                        var comdate = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
                        var uname = reader.IsDBNull(3) ? string.Empty : reader.GetString(3);
                        
                        StoryCommentDTO temp = new StoryCommentDTO
                        {
                            storyid = storyID.ToString(),
                            userid = userid,
                            storycomment = Convert.IsDBNull(reader["comment"]) ? string.Empty : (string?)reader["comment"] ?? string.Empty,
                            comdate = comdate,
                            uname = uname,
                            pimg = Convert.IsDBNull(reader["profileimg"]) ? string.Empty : (string?)reader["profileimg"] ?? string.Empty,
                        };
                        storyCommentDTO.Add(temp);
                    }
            }

            return storyCommentDTO;
        }


        public List<StoryCommentDTO> Getfanof(string userID)
        {
            List<StoryCommentDTO> storyCommentDTO = new List<StoryCommentDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                //  cmd.CommandText = @"select c.followingid,u.profileimg,u.name from following c inner join usertbl u on u.userid=c.followingid where c.followingid<>@userID";

                cmd.CommandText = @"select c.followingid,u.profileimg,u.name from following c inner join usertbl u on u.userid=c.followingid where c.userid=@userID";
                cmd.Parameters.AddWithValue("@userid", userID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                            var userId = reader.IsDBNull(0) ? string.Empty : reader.GetString(0);
                            var userName = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
                        
                            StoryCommentDTO temp = new StoryCommentDTO
                            {
                                userid = userId,
                                uname = userName,
                                pimg = Convert.IsDBNull(reader["profileimg"]) ? string.Empty : (string?)reader["profileimg"] ?? string.Empty,
                            };
                        storyCommentDTO.Add(temp);
                    }
            }

            return storyCommentDTO;
        }


        public List<StoryCommentDTO> Getfanclub(string userID)
        {
            List<StoryCommentDTO> storyCommentDTO = new List<StoryCommentDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                //   cmd.CommandText = @"select c.userid,u.profileimg,u.name from lhzpvxok_vtelltales.following c inner join usertbl u on u.userid=c.userid where c.userid=@userID";
             
                cmd.CommandText = @"select c.userid,u.profileimg,u.name from lhzpvxok_vtelltales.following c inner join usertbl u on u.userid=c.userid where c.followingid=@userID";
                cmd.Parameters.AddWithValue("@userid", userID);

                using (var reader = cmd.ExecuteReader())
                    while (reader.Read())
                    {
                        var userId = reader.IsDBNull(0) ? string.Empty : reader.GetString(0);
                        var userName = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
                        
                        StoryCommentDTO temp = new StoryCommentDTO
                        {
                            userid = userId,
                            uname = userName,
                            pimg = Convert.IsDBNull(reader["profileimg"]) ? string.Empty : (string?)reader["profileimg"] ?? string.Empty,
                        };
                        storyCommentDTO.Add(temp);
                    }
            }

            return storyCommentDTO;
        }




    }
}
