using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models.EAV;

namespace Website.Views.HtmlHelpers
{
    public interface IAttributeHelper
    {
        Task Render(Attribute attribute, DisplaySetting options = DisplaySetting.Render);
        List<Attribute> GetAttributes();
    }
}
