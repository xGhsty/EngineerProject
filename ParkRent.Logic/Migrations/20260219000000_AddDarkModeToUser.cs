using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ParkRent.Storage.Migrations
{
    /// <inheritdoc />
    public partial class AddDarkModeToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "DarkMode",
                schema: "ParkRent",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DarkMode",
                schema: "ParkRent",
                table: "Users");
        }
    }
}
