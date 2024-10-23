using System;
using System.Collections.Generic;

namespace Lib.BusinessLogic.Model
{
    public class DMBannerModel : BaseModel
    {
        public int UuTien { get; set; }
        public string TieuDe { get; set; }
        public string UrlHinhAnh { get; set; }
        public string UrlHinhAnhMobile { get; set; }
        public string LinkWeb { get; set; }
    }
}
