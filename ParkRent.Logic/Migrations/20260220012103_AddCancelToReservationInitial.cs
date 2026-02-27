using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ParkRent.Storage.Migrations
{
    /// <inheritdoc />
    public partial class AddCancelToReservationInitial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                schema: "ParkRent",
                table: "Reservations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCancelled",
                schema: "ParkRent",
                table: "Reservations",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CancelledAt",
                schema: "ParkRent",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "IsCancelled",
                schema: "ParkRent",
                table: "Reservations");
        }
    }
}
