using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using Website.DAL;
using Attribute = Website.Common.Models.EAV.Attribute;

namespace Website.BL.SL.CystemSL
{
    public class CystemService : Service<BasicViewModel>, ICystemService
    {
        public CystemService(DataContext context, IMapper mapper) : base(context, mapper)
        {
        }

        public override BasicViewModel Create(BasicViewModel viewModel)
        {
            throw new NotImplementedException();
        }

        public override void Delete(BasicViewModel viewModel)
        {
            throw new NotImplementedException();
        }

        public override Task<BasicViewModel> Get(BasicViewModel viewModel)
        {
            throw new NotImplementedException();
        }

        public override void Store(BasicViewModel viewModel)
        {
            throw new NotImplementedException();
        }

        public void Test()
        {
            /*context.Values.Add(new PageValue {
                Attribute = new Attribute { Label = "Overview"},
                Url = "/",
                Int = 1,
                Values = new List<Value>
                {
                    new IntValue
                    {
                        Attribute = new Attribute { Label = "Number"},
                        Int = 10
                    },
                    new StringValue
                    {
                        Attribute = new Attribute { Label = "Title"},
                        String = "Test"
                    },
                    new TemplateValue
                    {
                        Attribute = new Attribute { Label = "Test number"},
                        Int = 2
                    },
                    new GroupValue
                    {
                        Attribute = new Attribute { Label = "Test group"},
                        Values = new List<Value>
                        {
                            new IntValue
                            {
                                Attribute = new Attribute { Label = "Test number in group"},
                                Int = 1
                            }
                        }
                    }
                }
            });*/

            /*context.Values.Add(new PageValue
            {
                Attribute = new Attribute { Label = "Header" },
                Url = "/cystem/header",
                String = "header"
            });

            context.Values.Add(new PageValue
            {
                Attribute = new Attribute { Label = "Footer" },
                Url = "/cystem/footer",
                String = "footer"
            });

            context.Values.Add(new PageValue
            {
                Attribute = new Attribute { Label = "Overlay" },
                Url = "/cystem/layout",
                String = "overlay"
            });*/

            context.SaveChanges();
        }
    }
}
