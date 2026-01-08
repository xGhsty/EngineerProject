using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ParkRent.Storage.Migrations
{
    /// <inheritdoc />
    public partial class AddUsernameToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_ParkingSpots_ParkingSlotId",
                schema: "ParkRent",
                table: "Reservations");

            migrationBuilder.RenameColumn(
                name: "ParkingSlotId",
                schema: "ParkRent",
                table: "Reservations",
                newName: "ParkingSpotId");

            migrationBuilder.RenameIndex(
                name: "IX_Reservations_ParkingSlotId",
                schema: "ParkRent",
                table: "Reservations",
                newName: "IX_Reservations_ParkingSpotId");

            migrationBuilder.AddColumn<string>(
                name: "Username",
                schema: "ParkRent",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_UserId",
                schema: "ParkRent",
                table: "Reservations",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_ParkingSpots_ParkingSpotId",
                schema: "ParkRent",
                table: "Reservations",
                column: "ParkingSpotId",
                principalSchema: "ParkRent",
                principalTable: "ParkingSpots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Users_UserId",
                schema: "ParkRent",
                table: "Reservations",
                column: "UserId",
                principalSchema: "ParkRent",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_ParkingSpots_ParkingSpotId",
                schema: "ParkRent",
                table: "Reservations");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Users_UserId",
                schema: "ParkRent",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_UserId",
                schema: "ParkRent",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "Username",
                schema: "ParkRent",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "ParkingSpotId",
                schema: "ParkRent",
                table: "Reservations",
                newName: "ParkingSlotId");

            migrationBuilder.RenameIndex(
                name: "IX_Reservations_ParkingSpotId",
                schema: "ParkRent",
                table: "Reservations",
                newName: "IX_Reservations_ParkingSlotId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_ParkingSpots_ParkingSlotId",
                schema: "ParkRent",
                table: "Reservations",
                column: "ParkingSlotId",
                principalSchema: "ParkRent",
                principalTable: "ParkingSpots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
