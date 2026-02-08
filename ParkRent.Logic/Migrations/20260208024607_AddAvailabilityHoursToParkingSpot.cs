using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ParkRent.Storage.Migrations
{
    /// <inheritdoc />
    public partial class AddAvailabilityHoursToParkingSpot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeSpan>(
                name: "AvailableFrom",
                schema: "ParkRent",
                table: "ParkingSpots",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "AvailableTo",
                schema: "ParkRent",
                table: "ParkingSpots",
                type: "time",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvailableFrom",
                schema: "ParkRent",
                table: "ParkingSpots");

            migrationBuilder.DropColumn(
                name: "AvailableTo",
                schema: "ParkRent",
                table: "ParkingSpots");
        }
    }
}
