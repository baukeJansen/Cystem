using AutoMapper;
using Website.Common.Models;
using Website.Common.Viewmodels;

namespace Website.Common.AutoMapper
{
    public class MapperProfile : Profile
    {
        public MapperProfile()
        {
            CreateMap<Value, ValueViewModel>(MemberList.None);
            CreateMap<ValueViewModel, Value>(MemberList.None)
                .AfterMap((s, d) => { d.SerializedString = s.SerializedString; });

            CreateMap<Group, GroupViewModel>(MemberList.None);
            CreateMap<GroupViewModel, Group>(MemberList.None);

            CreateMap<Value, GenericViewModel>(MemberList.None);
            CreateMap<GenericViewModel, Value>(MemberList.None);

            CreateMap<GenericViewModel, ExceptionViewModel>(MemberList.None);
            CreateMap<ExceptionViewModel, GenericViewModel>(MemberList.None);
        }
    }
}
