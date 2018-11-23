using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Extensions;

namespace Website.Views.HtmlHelpers
{
    public class CystemLink<TController> : IDisposable where TController : class
    {
        private bool _disposed;
        private readonly FormContext _originalFormContext;
        private readonly ViewContext _viewContext;
        private readonly TagBuilder _builder;
        private readonly TextWriter _writer;

        public CystemLink(ViewContext viewContext, Expression<Action<TController>> action, object routeValues, object htmlAttributes, LinkType linkType)
        {
            _viewContext = viewContext ?? throw new ArgumentNullException("viewContext");

            _writer = viewContext.Writer;
            _originalFormContext = viewContext.FormContext;
            viewContext.FormContext = new FormContext();
            _builder = new TagBuilder("a");

            IUrlHelper urlHelper = new UrlHelper(_viewContext);
            string url = urlHelper.Action(action, routeValues);

            _builder.AddHtmlAttributes(htmlAttributes);

            _builder.Attributes.Add("href", url);
            switch (linkType)
            {
                case LinkType.Navigate: _builder.AddCssClass("navigate"); break;
                case LinkType.Popup: _builder.AddCssClass("popup"); break;
            }

            Begin();
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        public void Begin()
        {
            IHtmlContent htmlContent = _builder.RenderStartTag();
            _writer.Write(htmlContent);
        }

        private void End()
        {
            IHtmlContent htmlContent = _builder.RenderEndTag();
            _writer.Write(htmlContent);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                _disposed = true;
                End();

                if (_viewContext != null)
                {
                    //_viewContext.OutputClientValidation();
                    _viewContext.FormContext = _originalFormContext;
                }
            }
        }

        public void EndLink()
        {
            Dispose(true);
        }
    }
}
