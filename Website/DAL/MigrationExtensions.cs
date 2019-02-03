using Microsoft.EntityFrameworkCore.Migrations;
using System.Collections.Generic;
using System.IO;

namespace Website.DAL
{
    public static class MigrationExtensions
    {
        const string StoredProcLocation = "DAL\\StoredProcs\\";

        public static List<string> GetStoredProcs(this Migration migration)
        {
            return new List<string>
            {
                StoredProcLocation + "GetValues.sql",
                StoredProcLocation + "DeleteValues.sql"
            };
        }

        public static void UpdateStoredProcs(this Migration migration, MigrationBuilder migrationBuilder)
        {
            List<string> storedProcs = migration.GetStoredProcs();

            foreach(string storedProc in storedProcs)
            {
                //Directory.GetParent(Directory.GetCurrentDirectory()).FullName
                string sql = Path.Combine(Directory.GetCurrentDirectory(), storedProc);
                migrationBuilder.Sql(File.ReadAllText(sql));
            }
        }
    }
}
