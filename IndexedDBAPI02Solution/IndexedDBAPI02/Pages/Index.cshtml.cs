using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace IndexedDBAPI02.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ILogger<IndexModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {

        }
        public IActionResult OnGetMP4(string videoName)
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "Videos", videoName + ".mp4");

            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                stream.CopyTo(memory);
            }
            memory.Position = 0;
            return File(memory, "video/mp4", Path.GetFileName(filePath));
        }
        public IActionResult OnGetWebm(string videoName)
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "Videos", videoName + ".webm"); 
            
            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                stream.CopyTo(memory);
            }
            memory.Position = 0;
            return File(memory, "video/mp4", Path.GetFileName(filePath));
        }
    }
}
