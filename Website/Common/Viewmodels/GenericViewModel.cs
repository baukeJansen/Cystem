using Website.Common.Enums;
using Website.Common.Models.EAV;

namespace Website.Common.Viewmodels
{
    public class GenericViewModel : ActionViewModel
    {
        public Value Value { get; set; }
        public RenderOption Options { get; set; }
    }
}
