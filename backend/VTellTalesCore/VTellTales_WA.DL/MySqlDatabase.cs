using System;
using MySqlConnector;

namespace VTellTales_WA.DL
{
    public class MySqlDatabase : IDisposable
    {
        public MySqlConnection Connection { get; }

        public MySqlDatabase(string connectionString)
        {
            Connection = new MySqlConnection(connectionString);
            Connection.Open();
        }

        public void Dispose()
        {
            Connection.Dispose();
        }
    }
}
