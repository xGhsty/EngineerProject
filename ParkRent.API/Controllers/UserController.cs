//using Microsoft.AspNetCore.Mvc;
//using ParkRent.Logic.Entities;
//using ParkRent.Logic.Repository;

//namespace ParkRent.API.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    public class UserController : Controller
//    {
//        private readonly IUserRepository _userRepository;

//        public UserController(IUserRepository userRepository)
//        {
//            _userRepository = userRepository;
//        }

//        [HttpGet]
//        public async Task<IActionResult> GetAllUsers()
//        {
//            var users = await _userRepository.GetAllAsync();
//            return Ok(users);
//        }

//        [HttpGet("{id}")]
//        public async Task<IActionResult> GetUserById(Guid id)
//        {
//            var user = await _userRepository.GetByIdAsync(id);                                                          
//            if (user == null)
//            {
//                return NotFound();
//            }
//            return Ok(user);
//        }

//        [HttpPost]
//        public async Task<IActionResult> CreateUser(User user)
//        {
//            if (user == null)
//            {
//                return BadRequest("User cannot be null.");
//            }

//            await _userRepository.AddUser(user);
//            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
//        }
//        [HttpPut("{id}")]
//        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] User user)
//        {
//            if (user == null || user.Id != id)
//            {
//                return BadRequest("User data is invalid.");
//            }

//            var existingUser = await _userRepository.GetByIdAsync(id);
//            if (existingUser == null)
//            {
//                return NotFound();
//            }

//            await _userRepository.UpdateUser(user);
//            return NoContent();
//        }

//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteUser(Guid id)
//        {
//            var user = await _userRepository.GetByIdAsync(id);
//            if (user == null)
//            {
//                return NotFound();
//            }

//            await _userRepository.DeleteUser(user);
//            return NoContent();
//        }
//    }
//}
