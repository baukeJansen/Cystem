using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;

namespace Website.Common.AutoMapper
{
    public class MapperProfile : Profile
    {
        public MapperProfile()
        {
            CreateMap<PageValue, GenericViewModel>(MemberList.None);
            CreateMap<GenericViewModel, PageValue>(MemberList.None);

            CreateMap<Daily, DailyEggViewModel>(MemberList.None);
            CreateMap<DailyEggViewModel, Daily>(MemberList.None);

            CreateMap<Daily, DeadChickenViewModel>(MemberList.None);
            CreateMap<DeadChickenViewModel, Daily>(MemberList.None);
        }
    }
}
