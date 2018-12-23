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
            CreateMap<PageValue, GenericViewModel>(MemberList.None);
            CreateMap<GenericViewModel, PageValue>(MemberList.None);

            CreateMap<Daily, DailyEggViewModel>(MemberList.None);
            CreateMap<DailyEggViewModel, Daily>(MemberList.None); 

            CreateMap<Daily, DeadChickenViewModel>(MemberList.None);
            CreateMap<DeadChickenViewModel, Daily>(MemberList.None);

            CreateMap<PageValue, ValueViewModel>(MemberList.None)
                .ForMember(dest => dest.SerializedString, opt => opt.MapFrom(src => src.SerializedString));
            CreateMap<ValueViewModel, PageValue>(MemberList.None)
                .ForMember(dest => dest.SerializedString, opt => opt.MapFrom(src => src.SerializedString))
                .AfterMap((s, d) => { d.SerializedString = s.SerializedString; });

            CreateMap<TemplateValue, ValueViewModel>(MemberList.None);
            CreateMap<ValueViewModel, TemplateValue>(MemberList.None);

            CreateMap<StringValue, ValueViewModel>(MemberList.None);
            CreateMap<ValueViewModel, StringValue>(MemberList.None);

            CreateMap<IntValue, ValueViewModel>(MemberList.None);
            CreateMap<ValueViewModel, IntValue>(MemberList.None);

            CreateMap<GroupValue, ValueViewModel>(MemberList.None);
            CreateMap<ValueViewModel, GroupValue>(MemberList.None);

            CreateMap<Attribute, AttributeViewModel>(MemberList.None);
            CreateMap<AttributeViewModel, Attribute>(MemberList.None);
        }
    }
}
