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

            Attribute title = context.Attributes.Where(a => a.Label == "Title").FirstOrDefault();
            //Attribute text = context.Attributes.Where(a => a.Label == "Text").FirstOrDefault();
            Attribute text = new Attribute { Label = "Text" };
            Attribute card = context.Attributes.Where(a => a.Label == "Card").FirstOrDefault();
            Attribute link = context.Attributes.Where(a => a.Label == "Link").FirstOrDefault();

            context.Attributes.Add(text);
            //context.Attributes.Add(link);
            context.SaveChanges();

            context.Values.Add(new PageValue
            {
                Attribute = new Attribute { Label = "Overview" },
                Url = "/cystem/",
                TemplateName = "cystemOverview",

                Values = new List<Value>
                {
                    new StringValue
                    {
                        Attribute = title,
                        String = "Overzicht"
                    },

                    new GroupValue
                    {
                        Attribute = new Attribute {Label = "Cards"},
                        Values = new List<Value>
                        {
                            new TemplateValue {
                                Attribute = card,
                                Values = new List<Value>
                                {
                                    new StringValue
                                    {
                                        Attribute = title,
                                        String = "Legpercentage"
                                    },
                                    new StringValue
                                    {
                                        Attribute = text,
                                        String = "Geef hier het legpercentage op en bekijk de huidige gevens."
                                    },
                                    new StringValue
                                    {
                                        Attribute = link,
                                        String = "/cystem/dailyegg/"
                                    }
                                }
                            },

                            new TemplateValue {
                                Attribute = card,
                                Values = new List<Value>
                                {
                                    new StringValue
                                    {
                                        Attribute = title,
                                        String = "Dode kippen"
                                    },
                                    new StringValue
                                    {
                                        Attribute = text,
                                        String = "Vul hier het aantal dode kippen in."
                                    },
                                    new StringValue
                                    {
                                        Attribute = link,
                                        String = "/cystem/deadchicken/"
                                    }
                                }
                            },

                            new TemplateValue {
                                Attribute = card,
                                Values = new List<Value>
                                {
                                    new StringValue
                                    {
                                        Attribute = title,
                                        String = "Test"
                                    },
                                    new StringValue
                                    {
                                        Attribute = text,
                                        String = "I am a very simple card. I am good at containing small bits of information. <br/> I am convenient because I require little markup to use effectively."
                                    }
                                }
                            },

                        }
                    }
                }
            });

            context.SaveChanges();
        }
    }
}
