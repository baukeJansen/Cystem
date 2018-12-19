using System.ComponentModel.DataAnnotations.Schema;
using Website.Common.Models.EAV.EAVInterfaces;

namespace Website.Common.Models.EAV
{
    public class PageValue : TemplateValue, ISerializedStringValue
    {
        public string SerializedString { get; set; }

        [NotMapped]
        public string Url {
            get => SerializedString;
            set => SerializedString = value;
        }
    }
}
