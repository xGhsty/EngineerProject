using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace ParkRent.Functionality.Security
{
    public class PasswordHasher
    {
        public string Hash(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool Verify(string password, string storeHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, storeHash);
        }
    }
}
