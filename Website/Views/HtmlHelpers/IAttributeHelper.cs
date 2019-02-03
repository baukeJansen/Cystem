using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models;

namespace Website.Views.HtmlHelpers
{
    public interface IGroupHelper
    {
        Task Render(Group group, DisplaySetting options = DisplaySetting.Render);
        List<Group> GetGroups();
    }
}
