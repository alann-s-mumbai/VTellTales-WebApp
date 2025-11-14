using System;

namespace VTellTales_WA.DTO
{
    public class CollaboratorDTO
    {
        public int id { get; set; }
        public int storyid { get; set; }
        public string collaboratorid { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        public string role { get; set; }
        public string? permissions { get; set; }
        public DateTime createdate { get; set; }
        public DateTime updatedate { get; set; }

        public CollaboratorDTO()
        {
            collaboratorid = string.Empty;
            name = string.Empty;
            email = string.Empty;
            role = string.Empty;
            permissions = null;
            createdate = DateTime.MinValue;
            updatedate = DateTime.MinValue;
        }
    }
}
