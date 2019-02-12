using Microsoft.AspNetCore.Mvc;

namespace Website.Controllers.Cystem
{
    [Area("Cystem")]
    public class TestController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            return PartialView();
        }
    }
}
