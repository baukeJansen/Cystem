using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;
using Website.Common.Viewmodels;

namespace Website.Common.AutoMapper
{
    public class MapperProfile : Profile
    {
        public MapperProfile()
        {
            CreateMap<Entity, GenericViewModel>(MemberList.None);
            CreateMap<GenericViewModel, Entity>(MemberList.None);

            CreateMap<Page, GenericViewModel>(MemberList.None);
            CreateMap<GenericViewModel, Page>(MemberList.None);

            CreateMap<Daily, DailyEggViewModel>(MemberList.None);
            CreateMap<DailyEggViewModel, Daily>(MemberList.None);

            CreateMap<Daily, DeadChickenViewModel>(MemberList.None);
            CreateMap<DeadChickenViewModel, Daily>(MemberList.None);
        }
    }
}
