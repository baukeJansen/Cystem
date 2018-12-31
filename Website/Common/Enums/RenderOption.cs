using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Enums
{
    public class RenderOptions
    {
        public int options = 0;

        public RenderOptions(params RenderOption[] renderOptions)
        {
            foreach(RenderOption option in renderOptions)
            {
                options = options | (int)option;
            }
        }
    }

    [Flags]
    public enum RenderOption
    {
        Display = 1,
        List = 2,
        Edit = 4,
    }
}
