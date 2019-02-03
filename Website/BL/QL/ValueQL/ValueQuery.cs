using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Website.Common.Data;
using Website.Common.Extensions;
using Website.Common.Models;
using Website.DAL;

namespace Website.BL.QL.ValueQL
{
    public class ValueQuery : Query, IValueQuery
    {
        public ValueQuery(DataContext context) : base(context) { }

        public async Task<QueryResult> GetValues(int id, int param = 0)
        {
            List<SqlParameter> parameters = new List<SqlParameter>
            {
                new SqlParameter("@id", SqlDbType.Int)
                {
                    Value = id
                },
                new SqlParameter("@url", SqlDbType.NVarChar)
                {
                    Value = null
                },
                new SqlParameter("@recursionDepth", SqlDbType.Int){
                    Value = 20
                },
                new SqlParameter("@relatedRecursionDepth", SqlDbType.Int) {
                    Value = 2
                },
                new SqlParameter("@param", SqlDbType.Int)
                {
                    Value = param
                }
            };

            return await GetValues(parameters);
        }

        public async Task<QueryResult> GetValues(string url, int param = 0)
        {
            List<SqlParameter> parameters = new List<SqlParameter>
            {
                new SqlParameter("@id", SqlDbType.Int)
                {
                    Value = 0
                },
                new SqlParameter("@url", SqlDbType.NVarChar)
                {
                    Value = url
                },
                new SqlParameter("@recursionDepth", SqlDbType.Int){
                    Value = 20
                },
                new SqlParameter("@relatedRecursionDepth", SqlDbType.Int) {
                    Value = 2
                },
                new SqlParameter("@param", SqlDbType.Int)
                {
                    Value = param
                }
            };

            return await GetValues(parameters);
        }

        public async Task<QueryResult> GetValues(List<SqlParameter> parameters)
        {
            QueryResult result = new QueryResult();

            using (SqlCommand command = new SqlCommand())
            {
                command.CommandText = "GetValues";
                AddParameters(command, parameters);

                command.Connection = (SqlConnection)context.Database.GetDbConnection();

                await command.Connection.OpenAsync();
                using (SqlDataReader reader = await command.ExecuteReaderAsync(CommandBehavior.CloseConnection))
                {
                    while (reader.HasRows && await reader.ReadAsync())
                    {
                        Value value = new Value();
                        reader.MapDataToObject(value);
                        result.Values.Add(value);
                    }

                    if (await reader.NextResultAsync())
                    {
                        while (reader.HasRows && await reader.ReadAsync())
                        {
                            Group group = new Group();
                            reader.MapDataToObject(group);
                            result.Groups.Add(group);
                        }
                    }

                }
            }

            return result;
        }

        public async Task<QueryResult> PreviewDeleteCascade(int id)
        {
            QueryResult result = new QueryResult();

            List<SqlParameter> parameters = new List<SqlParameter>
            {
                new SqlParameter("@id", SqlDbType.Int)
                {
                    Value = id
                },
                new SqlParameter("@preview", SqlDbType.Bit)
                {
                    Value = true
                }
            };

            using (SqlCommand command = new SqlCommand())
            {
                command.CommandText = "DeleteValues";
                AddParameters(command, parameters);


                command.Connection = (SqlConnection)context.Database.GetDbConnection();
                await command.Connection.OpenAsync();
                using (SqlDataReader reader = await command.ExecuteReaderAsync(CommandBehavior.CloseConnection))
                {
                    while (reader.HasRows && await reader.ReadAsync())
                    {
                        Value value = new Value();
                        reader.MapDataToObject(value);
                        result.Values.Add(value);
                    }

                    if (await reader.NextResultAsync())
                    {
                        while (reader.HasRows && await reader.ReadAsync())
                        {
                            Group group = new Group();
                            reader.MapDataToObject(group);
                            result.Groups.Add(group);
                        }
                    }

                }
            }

            return result;
        }

        public async Task DeleteValueCascade(int id)
        {
            List<SqlParameter> parameters = new List<SqlParameter>
            {
                new SqlParameter("@id", SqlDbType.Int)
                {
                    Value = id
                },
                new SqlParameter("@preview", SqlDbType.Bit)
                {
                    Value = false
                }
            };

            using (SqlCommand command = new SqlCommand())
            {
                command.CommandText = "DeleteValues";
                AddParameters(command, parameters);
                

                command.Connection = (SqlConnection)context.Database.GetDbConnection();
                await command.Connection.OpenAsync();
                await command.ExecuteNonQueryAsync();
            }
        }

        private void AddParameters(SqlCommand command, List<SqlParameter> parameters)
        {
            string commandParameters = "";
            foreach (SqlParameter parameter in parameters)
            {
                commandParameters += commandParameters == "" ? " " : ", ";
                commandParameters += parameter.ParameterName + " = " + parameter.ParameterName + "PARAM";
                parameter.ParameterName += "PARAM";
                command.Parameters.Add(parameter);
            }

            command.CommandText += commandParameters;
        }
    }
}
