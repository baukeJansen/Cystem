#pragma checksum "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml" "{ff1816ec-aa5e-4d10-87f7-6f4963833460}" "ef0f328b5c8f30480aa3897fb686028a3f5ecb15"
// <auto-generated/>
#pragma warning disable 1591
[assembly: global::Microsoft.AspNetCore.Razor.Hosting.RazorCompiledItemAttribute(typeof(AspNetCore.Views_Cystem_DailyEgg_Edit), @"mvc.1.0.view", @"/Views/Cystem/DailyEgg/Edit.cshtml")]
[assembly:global::Microsoft.AspNetCore.Mvc.Razor.Compilation.RazorViewAttribute(@"/Views/Cystem/DailyEgg/Edit.cshtml", typeof(AspNetCore.Views_Cystem_DailyEgg_Edit))]
namespace AspNetCore
{
    #line hidden
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Microsoft.AspNetCore.Mvc.ViewFeatures;
#line 1 "C:\dev\Website\Website\Views\_ViewImports.cshtml"
using Website;

#line default
#line hidden
#line 2 "C:\dev\Website\Website\Views\_ViewImports.cshtml"
using Website.Views.HtmlHelpers;

#line default
#line hidden
#line 1 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
using Website.Common.Data;

#line default
#line hidden
#line 2 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
using Website.Common.Enums;

#line default
#line hidden
#line 3 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
using Website.Common.Extensions;

#line default
#line hidden
#line 4 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
using Website.Common.Viewmodels;

#line default
#line hidden
#line 5 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
using Website.Controllers.Cystem;

#line default
#line hidden
    [global::Microsoft.AspNetCore.Razor.Hosting.RazorSourceChecksumAttribute(@"SHA1", @"ef0f328b5c8f30480aa3897fb686028a3f5ecb15", @"/Views/Cystem/DailyEgg/Edit.cshtml")]
    [global::Microsoft.AspNetCore.Razor.Hosting.RazorSourceChecksumAttribute(@"SHA1", @"8eff7fda0199cad83867dc19b8778fc2a8e88d77", @"/Views/_ViewImports.cshtml")]
    public class Views_Cystem_DailyEgg_Edit : global::Microsoft.AspNetCore.Mvc.Razor.RazorPage<DailyEggViewModel>
    {
        #pragma warning disable 1998
        public async override global::System.Threading.Tasks.Task ExecuteAsync()
        {
            BeginContext(186, 27, true);
            WriteLiteral("\r\n<div class=\"container\">\r\n");
            EndContext();
#line 9 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
     using (Html.BeginForm<DailyEggController>(c => c.Store(Param<DailyEggViewModel>.Any), new { }, FormMethod.Post, true, new { }))
    {
        

#line default
#line hidden
            BeginContext(363, 25, false);
#line 11 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
   Write(Html.HiddenFor(m => m.Id));

#line default
#line hidden
            EndContext();
            BeginContext(392, 199, true);
            WriteLiteral("        <div class=\"row\">\r\n            <div class=\"col s12\">\r\n                <h2>Legpercentage</h2>\r\n                <b>Geef het aantal afgedraaide eiren op</b>\r\n            </div>\r\n        </div>\r\n");
            EndContext();
            BeginContext(593, 93, true);
            WriteLiteral("        <div class=\"row\">\r\n            <div class=\"input-field col l6 s12\">\r\n                ");
            EndContext();
            BeginContext(687, 58, false);
#line 22 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
           Write(Html.DropDownListFor(m => m.ExportType, Model.ExportTypes));

#line default
#line hidden
            EndContext();
            BeginContext(745, 18, true);
            WriteLiteral("\r\n                ");
            EndContext();
            BeginContext(764, 32, false);
#line 23 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
           Write(Html.LabelFor(m => m.ExportType));

#line default
#line hidden
            EndContext();
            BeginContext(796, 38, true);
            WriteLiteral("\r\n            </div>\r\n        </div>\r\n");
            EndContext();
            BeginContext(836, 93, true);
            WriteLiteral("        <div class=\"row\">\r\n            <div class=\"input-field col l6 s12\">\r\n                ");
            EndContext();
            BeginContext(930, 107, false);
#line 29 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
           Write(Html.EditorFor(m => m.Date, new { htmlAttributes = new { @class = "validate datepicker", type = "text" } }));

#line default
#line hidden
            EndContext();
            BeginContext(1037, 18, true);
            WriteLiteral("\r\n                ");
            EndContext();
            BeginContext(1056, 26, false);
#line 30 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
           Write(Html.LabelFor(m => m.Date));

#line default
#line hidden
            EndContext();
            BeginContext(1082, 38, true);
            WriteLiteral("\r\n            </div>\r\n        </div>\r\n");
            EndContext();
            BeginContext(1122, 129, true);
            WriteLiteral("        <div class=\"row\">\r\n            <div class=\"col s12\">\r\n                <b>Eieren</b>\r\n            </div>\r\n        </div>\r\n");
            EndContext();
            BeginContext(1253, 485, true);
            WriteLiteral(@"        <div class=""row"">
            <div class=""col l6 s12"">
                <ul class=""tabs formtab"">
                    <li class=""tab col s3""><a href=""#stacks""><input type=""radio"" name=""EggInputType"" class=""hide"" value=""Stacks"" checked=""checked"" />Stapels</a></li>
                    <li class=""tab col s3""><a href=""#separate""><input type=""radio"" name=""EggInputType"" class=""hide"" value=""Separate"" />Los</a></li>
                </ul>

            </div>
        </div>
");
            EndContext();
            BeginContext(1740, 74, true);
            WriteLiteral("        <div class=\"row\">\r\n            <div id=\"stacks\">\r\n                ");
            EndContext();
            BeginContext(1815, 33, false);
#line 52 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
           Write(Html.EditorFor(m => m.EggStaples));

#line default
#line hidden
            EndContext();
            BeginContext(1848, 104, true);
            WriteLiteral("\r\n            </div>\r\n\r\n            <div id=\"separate\" class=\"input-field col l6 s12\">\r\n                ");
            EndContext();
            BeginContext(1953, 81, false);
#line 56 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
           Write(Html.EditorFor(m => m.Eggs, new { htmlAttributes = new { @class = "validate" } }));

#line default
#line hidden
            EndContext();
            BeginContext(2034, 18, true);
            WriteLiteral("\r\n                ");
            EndContext();
            BeginContext(2053, 26, false);
#line 57 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
           Write(Html.LabelFor(m => m.Eggs));

#line default
#line hidden
            EndContext();
            BeginContext(2079, 38, true);
            WriteLiteral("\r\n            </div>\r\n        </div>\r\n");
            EndContext();
            BeginContext(2121, 105, true);
            WriteLiteral("        <div class=\"row\">\r\n            <p class=\"col s12\">\r\n                <label>\r\n                    ");
            EndContext();
            BeginContext(2227, 90, false);
#line 65 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
               Write(Html.EditorFor(m => m.EmptyAfterRun, new { htmlAttributes = new { @class = "validate" } }));

#line default
#line hidden
            EndContext();
            BeginContext(2317, 28, true);
            WriteLiteral("\r\n                    <span>");
            EndContext();
            BeginContext(2346, 41, false);
#line 66 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
                     Write(Html.DisplayNameFor(m => m.EmptyAfterRun));

#line default
#line hidden
            EndContext();
            BeginContext(2387, 69, true);
            WriteLiteral("</span>\r\n                </label>\r\n            </p>\r\n        </div>\r\n");
            EndContext();
            BeginContext(2458, 90, true);
            WriteLiteral("        <div class=\"row\">\r\n            <div class=\"input-field col s12\">\r\n                ");
            EndContext();
            BeginContext(2549, 105, false);
#line 73 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
           Write(Html.EditorFor(m => m.Remarks, new { htmlAttributes = new { @class = "materialize-textarea validate" } }));

#line default
#line hidden
            EndContext();
            BeginContext(2654, 18, true);
            WriteLiteral("\r\n                ");
            EndContext();
            BeginContext(2673, 29, false);
#line 74 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
           Write(Html.LabelFor(m => m.Remarks));

#line default
#line hidden
            EndContext();
            BeginContext(2702, 38, true);
            WriteLiteral("\r\n            </div>\r\n        </div>\r\n");
            EndContext();
            BeginContext(2742, 84, true);
            WriteLiteral("        <div class=\"row\">\r\n            <div class=\"right col s12\">\r\n                ");
            EndContext();
            BeginContext(2827, 86, false);
#line 80 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
           Write(Html.CystemSubmitButton("Save", "right", new { data_on_result = ElementAction.Close }));

#line default
#line hidden
            EndContext();
            BeginContext(2913, 2, true);
            WriteLiteral("\r\n");
            EndContext();
#line 81 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
                 if (Model.Id != 0)
                {
                

#line default
#line hidden
            BeginContext(2989, 187, false);
#line 83 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
            Write(Html.ActionLink<DailyEggController>("Delete", c => c.Delete(null), new { Id = Model.Id }, new { @class = "ajax-delete right btn-flat waves-effect", data_on_result = ElementAction.Close }));

#line default
#line hidden
            EndContext();
#line 83 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
                                                                                                                                                                                                              
                }

#line default
#line hidden
            BeginContext(3198, 36, true);
            WriteLiteral("            </div>\r\n        </div>\r\n");
            EndContext();
#line 87 "C:\dev\Website\Website\Views\Cystem\DailyEgg\Edit.cshtml"
    }

#line default
#line hidden
            BeginContext(3241, 6, true);
            WriteLiteral("</div>");
            EndContext();
        }
        #pragma warning restore 1998
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.ViewFeatures.IModelExpressionProvider ModelExpressionProvider { get; private set; }
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.IUrlHelper Url { get; private set; }
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.IViewComponentHelper Component { get; private set; }
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.Rendering.IJsonHelper Json { get; private set; }
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.Rendering.IHtmlHelper<DailyEggViewModel> Html { get; private set; }
    }
}
#pragma warning restore 1591
