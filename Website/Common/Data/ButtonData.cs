using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Enums;

namespace Website.Common.Data
{
    public class ButtonData
    {
        public string Text { get; set; }
        public string Icon { get; set; }
        public string Url { get; set; }
        public int MyProperty { get; set; }
        public DisplaySetting Options { get; set; }
        public string Attributes { get; internal set; }
        public bool Link { get; set; } = true;
    }
}
