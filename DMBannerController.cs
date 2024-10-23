using Lib.BusinessLogic.Management;
using Lib.BusinessLogic.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VTest.Admin.Helper;
using System.Net.Http;

namespace VTest.Admin.Controllers.Api
{
    [RoutePrefix("api/DMBanner")]
    public class DMBannerController : BaseApiController<DMBannerManager, DMBannerModel>
    {
        [Route("")]
        [HttpGet]
        public HttpResponseMessage Get()
        {
            var result = _manager.SelectBy(null, "UuTien");
            return ApiOk(result);
        }

        [Route("")]
        [HttpPost]
        public HttpResponseMessage Post(DMBannerModel value)
        {
            var ipId = _manager.InsertOrUpdate(value);
            return ApiOk(ipId);
        }

        [Route("{id}")]
        [HttpDelete]
        public HttpResponseMessage Delete(Guid id)
        {
            _manager.Delete(id);
            return ApiOk();
        }
    }
}