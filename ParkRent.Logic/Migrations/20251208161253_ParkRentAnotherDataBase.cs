using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ParkRent.Storage.Migrations
{
    /// <inheritdoc />
    public partial class ParkRentAnotherDataBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "ParkRent");

            migrationBuilder.CreateTable(
                name: "Users",
                schema: "ParkRent",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Surname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ParkingSpots",
                schema: "ParkRent",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParkingSpots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParkingSpots_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "ParkRent",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Reservations",
                schema: "ParkRent",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParkingSlotId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReservationStartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReservationEndTime = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reservations_ParkingSpots_ParkingSlotId",
                        column: x => x.ParkingSlotId,
                        principalSchema: "ParkRent",
                        principalTable: "ParkingSpots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ParkingSpots_UserId",
                schema: "ParkRent",
                table: "ParkingSpots",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_ParkingSlotId",
                schema: "ParkRent",
                table: "Reservations",
                column: "ParkingSlotId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reservations",
                schema: "ParkRent");

            migrationBuilder.DropTable(
                name: "ParkingSpots",
                schema: "ParkRent");

            migrationBuilder.DropTable(
                name: "Users",
                schema: "ParkRent");
        }
    }
}
