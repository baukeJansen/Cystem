using Website.Common.Enums;
using Website.Common.Models;

namespace Website.Common.Viewmodels
{
    public class GenericViewModel : ActionViewModel
    {
        public Value Value { get; set; }
        public DisplaySetting Options { get; set; }
    }
}
