
$(document).ready(function () {
    $("#viewOrders").on("click", function () {
        var button = $(this);
        var ordersBody = $("#ordersBody");

        button.prop("disabled", true).html("LOADING...");
        $("#message").hide();
        $("#errorMessage").hide();

        $.getJSON("orders.json")
            .done(function (orders) {
                ordersBody.empty();

                var totalSales = 0;
                var totalOrders = 0;

                $.each(orders, function (index, order) {
                    var statusClass = "other-status";

                    if (order.orderStatus === "Preparing") {
                        statusClass = "preparing";
                    } else if (order.orderStatus === "Ready") {
                        statusClass = "ready";
                    } else if (order.orderStatus === "Delivered") {
                        statusClass = "delivered";
                    }

                    var customer = $("<div>").addClass("customer-cell");
                    customer.append($("<strong>").text(order.customerName));
                    customer.append($("<span>").text(order.foodItem));

                    var row = $("<tr>");
                    row.append($("<td>").text(String(index + 1).padStart(2, "0")));
                    row.append(
                        $("<td>").addClass("order-id").text(order.orderId)
                    );
                    row.append($("<td>").append(customer));
                    row.append($("<td>").text(order.quantity));
                    row.append(
                        $("<td>").text(
                            "₹" + (Number(order.totalAmount) || 0).toLocaleString("en-IN")
                        )
                    );

                    var status = $("<span>")
                        .addClass("status")
                        .addClass(statusClass)
                        .text(order.orderStatus);

                    row.append($("<td>").append(status));
                    ordersBody.append(row);

                    totalOrders++;
                    totalSales += Number(order.totalAmount) || 0;
                });

                var formattedSales = "₹" + totalSales.toLocaleString("en-IN", {
                    maximumFractionDigits: 2
                });

                $("#totalOrders").text(totalOrders);
                $("#totalSales").text(formattedSales);
                $("#bottomSales").text(formattedSales);

                if (totalOrders === 0) {
                    ordersBody.html(
                        '<tr><td colspan="6" class="empty-state"><span class="empty-symbol">—</span><p>No records found</p><small>The orders.json file contains no orders.</small></td></tr>'
                    );
                }

                $("#message")
                    .text("Order records loaded successfully.")
                    .show();
            })
            .fail(function () {
                ordersBody.html(
                    '<tr><td colspan="6" class="empty-state"><span class="empty-symbol">!</span><p>Unable to load records</p><small>Check orders.json and run the page using Live Server.</small></td></tr>'
                );

                $("#totalOrders").text("0");
                $("#totalSales").text("₹0");
                $("#bottomSales").text("₹0");
                $("#errorMessage").show();
            })
            .always(function () {
                button.prop("disabled", false).html('LOAD DATA <span>↗</span>');
            });
    });
});
