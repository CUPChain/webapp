import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { assert, expect } from "chai";

const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
const MINTER_ROLE = ethers.id("MINTER_ROLE");

describe.only("Prescription Contract", function () {
    async function deploymentFixture() {
        const [owner, address1, address2] = await ethers.getSigners();

        const prescriptionContract = await ethers.deployContract("PrescriptionTokens");

        await prescriptionContract.waitForDeployment();

        const appointmentContract = await ethers.deployContract("AppointmentTokens", [prescriptionContract.target]);

        await appointmentContract.waitForDeployment();

        return { prescriptionContract, appointmentContract, owner, address1, address2 };
    }

    describe.only("Deployment", function () {
        it("Deployer has default admin role", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                address1,
                address2
            } = await loadFixture(deploymentFixture);

            expect(await prescriptionContract.hasRole(DEFAULT_ADMIN_ROLE, owner)).to.be.true;

            expect(await appointmentContract.hasRole(DEFAULT_ADMIN_ROLE, owner)).to.be.true;
        });

        it("Other role's admin is the default admin role", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                address1,
                address2
            } = await loadFixture(deploymentFixture);

            expect(await prescriptionContract.getRoleAdmin(MINTER_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);

            expect(await appointmentContract.getRoleAdmin(MINTER_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
        });
    });

    describe.only("Token name and symbol", function () {
        it("Token has correct name", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                address1,
                address2
            } = await loadFixture(deploymentFixture);

            expect(await prescriptionContract.name()).to.equal("Prescription");

            expect(await appointmentContract.name()).to.equal("Appointment");
        });

        it("Token has correct symbol", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                address1,
                address2
            } = await loadFixture(deploymentFixture);

            expect(await prescriptionContract.symbol()).to.equal("PRE");

            expect(await appointmentContract.symbol()).to.equal("APP");
        });
    });

    describe.only("Granting roles", function () {
        it("Should grant minter role correctly", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                address1,
                address2
            } = await loadFixture(deploymentFixture);

            expect(await prescriptionContract.connect(owner).grantRole(MINTER_ROLE, address1))
                .to.emit(prescriptionContract, "RoleGranted").withArgs(MINTER_ROLE, address1, owner);

            it("Doctor should now have minter role", async function () {
                expect(await prescriptionContract.hasRole(MINTER_ROLE, address1)).to.be.true;
            });

            expect(await appointmentContract.connect(owner).grantRole(MINTER_ROLE, address2))
                .to.emit(appointmentContract, "RoleGranted").withArgs(MINTER_ROLE, address2, owner);

            it("Hospital should now have minter role", async function () {
                expect(await appointmentContract.hasRole(MINTER_ROLE, address2)).to.be.true;
            });
        });

        it("Should not grant minter role", async function () {
            const {
                prescriptionContract,
                appointmentContract,
                owner,
                address1,
                address2
            } = await loadFixture(deploymentFixture);

            expect(await prescriptionContract.connect(address1).grantRole(MINTER_ROLE, address2))
                .to.be.revertedWithCustomError(prescriptionContract, "AccessControlUnauthorizedAccount");

            it("Doctor should not have minter role", async function () {
                expect(await prescriptionContract.hasRole(MINTER_ROLE, address2)).to.be.false;
            });

            expect(await appointmentContract.connect(address1).grantRole(MINTER_ROLE, address2))
                .to.be.revertedWithCustomError(appointmentContract, "AccessControlUnauthorizedAccount");

            it("Hospital should not have minter role", async function () {
                expect(await appointmentContract.hasRole(MINTER_ROLE, address2)).to.be.false;
            });
        });
    });
});