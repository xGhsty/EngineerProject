using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ParkRent.Logic.Entities;
using ParkRent.Storage.Entities;

namespace ParkRent.Logic
{
    public class ParkRentDbContext : DbContext
    {   
        private IConfiguration _configuration { get; }
        public DbSet<User> Users { get; set; }
        public DbSet<ParkingSpot> ParkingSpots { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<District> Districts { get; set; }

        public ParkRentDbContext(DbContextOptions<ParkRentDbContext> options, IConfiguration configuration) : base(options)
        {
            _configuration = configuration;
        }

        //zła metoda, nigdy nie hardcodowac adresu baz danych.
        //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        //{
        //    optionsBuilder.UseSqlServer(@"server=(localdb)\MSSQLLocalDB;database=parkrent;trusted_connection=true",
        //        x => x.MigrationsHistoryTable("__EFMigrationsHistory", "ParkRent"));

        //}
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reservations)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ParkingSpot>()
                .HasOne(ps => ps.User)
                .WithMany()
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<User>()
                .HasOne(u => u.District)
                .WithMany(d => d.Users)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
