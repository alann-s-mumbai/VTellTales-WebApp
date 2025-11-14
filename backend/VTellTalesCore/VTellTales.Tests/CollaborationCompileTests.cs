using System;
using VTellTales_WA.DTO;
using Xunit;

namespace VTellTales.Tests
{
    public class CollaborationCompileTests
    {
        [Fact]
        public void CollaboratorDTO_CanBeConstructed()
        {
            var c = new CollaboratorDTO
            {
                id = 1,
                storyid = 123,
                collaboratorid = "demo-user",
                name = "Demo User",
                email = "demo@vtelltales.com",
                role = "editor",
                permissions = "{\"edit\":true}",
                createdate = DateTime.UtcNow,
                updatedate = DateTime.UtcNow
            };

            Assert.Equal(123, c.storyid);
            Assert.Equal("demo-user", c.collaboratorid);
        }
    }
}
