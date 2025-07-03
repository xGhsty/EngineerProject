using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ParkRent.Storage.Migrations
{
    /// <inheritdoc />
    public partial class AdjustUserModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ParkingSpots_Users_UserId",
                schema: "ParkRent",
                table: "ParkingSpots");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Users_UserId",
                schema: "ParkRent",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_UserId",
                schema: "ParkRent",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_ParkingSpots_UserId",
                schema: "ParkRent",
                table: "ParkingSpots");

            migrationBuilder.DropColumn(
                name: "UserEmail",
                schema: "ParkRent",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UserHashedPassword",
                schema: "ParkRent",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "UserSurname",
                schema: "ParkRent",
                table: "Users",
                newName: "Password");

            migrationBuilder.RenameColumn(
                name: "UserName",
                schema: "ParkRent",
                table: "Users",
                newName: "Email");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                schema: "ParkRent",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Surname",
                schema: "ParkRent",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                schema: "ParkRent",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Surname",
                schema: "ParkRent",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "Password",
                schema: "ParkRent",
                table: "Users",
                newName: "UserSurname");

            migrationBuilder.RenameColumn(
                name: "Email",
                schema: "ParkRent",
                table: "Users",
                newName: "UserName");

            migrationBuilder.AddColumn<string>(
                name: "UserEmail",
                schema: "ParkRent",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserHashedPassword",
                schema: "ParkRent",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_UserId",
                schema: "ParkRent",
                table: "Reservations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ParkingSpots_UserId",
                schema: "ParkRent",
                table: "ParkingSpots",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ParkingSpots_Users_UserId",
                schema: "ParkRent",
                table: "ParkingSpots",
                column: "UserId",
                principalSchema: "ParkRent",
                principalTable: "Users",
                principalColumn: "Id");

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
    }
}
