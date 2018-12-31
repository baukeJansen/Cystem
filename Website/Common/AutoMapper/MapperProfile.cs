using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using Attribute = Website.Common.Models.EAV.Attribute;

namespace Website.Common.AutoMapper
{
    public class MapperProfile : Profile
    {
        public MapperProfile()
        {
            CreateMap<Daily, DailyEggViewModel>(MemberList.None);
            CreateMap<DailyEggViewModel, Daily>(MemberList.None); 

            CreateMap<Daily, DeadChickenViewModel>(MemberList.None);
            CreateMap<DeadChickenViewModel, Daily>(MemberList.None);

            CreateMap<Value, ValueViewModel>(MemberList.None);
            CreateMap<ValueViewModel, Value>(MemberList.None)
                .AfterMap((s, d) => { d.SerializedString = s.SerializedString; });

            CreateMap<Attribute, AttributeViewModel>(MemberList.None);
            CreateMap<AttributeViewModel, Attribute>(MemberList.None);

            CreateMap<Value, GenericViewModel>(MemberList.None);
            CreateMap<GenericViewModel, Value>(MemberList.None);
        }
    }
}
