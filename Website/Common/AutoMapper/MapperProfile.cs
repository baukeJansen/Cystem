using AutoMapper;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using Attribute = Website.Common.Models.EAV.Attribute;

namespace Website.Common.AutoMapper
{
    public class MapperProfile : Profile
    {
        public MapperProfile()
        {
            CreateMap<Value, ValueViewModel>(MemberList.None);
            CreateMap<ValueViewModel, Value>(MemberList.None)
                .AfterMap((s, d) => { d.SerializedString = s.SerializedString; });

            CreateMap<Attribute, AttributeViewModel>(MemberList.None);
            CreateMap<AttributeViewModel, Attribute>(MemberList.None);

            CreateMap<Value, GenericViewModel>(MemberList.None);
            CreateMap<GenericViewModel, Value>(MemberList.None);

            CreateMap<GenericViewModel, ExceptionViewModel>(MemberList.None);
            CreateMap<ExceptionViewModel, GenericViewModel>(MemberList.None);
        }
    }
}
