using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Enums
{
    public class DisplaySettings
    {
        public int options = 0;

        public DisplaySettings(params DisplaySetting[] renderOptions)
        {
            foreach(DisplaySetting option in renderOptions)
            {
                options = options | (int)option;
            }
        }
    }

    [Flags]
    public enum DisplaySetting
    {
        Render = 1,
        Display = 2,
        Edit = 4,
        Alter = 8,
        Json = 16,
        Xml = 32
    }
}
