using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ParkRent.Storage.Migrations
{
    /// <inheritdoc />
    public partial class ParkRent : Migration
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
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserSurname = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserHashedPassword = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                    IsAvailable = table.Column<bool>(type: "bit", nullable: true)
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
                    table.ForeignKey(
                        name: "FK_Reservations_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "ParkRent",
                        principalTable: "Users",
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

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_UserId",
                schema: "ParkRent",
                table: "Reservations",
                column: "UserId");
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
